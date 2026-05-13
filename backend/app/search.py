import httpx
import os
import base64
import numpy as np
from dotenv import load_dotenv
from fastapi import HTTPException, UploadFile
from PIL import Image
from io import BytesIO

load_dotenv()
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

SOURCE_MAPPINGS = {
    "article": "site:nytimes.com OR site:washingtonpost.com OR site:theguardian.com",
    "book": 'intitle:"book" OR intext:"published in"',
    "video": "site:youtube.com OR site:vimeo.com",
    "movie": 'intitle:"movie" OR intext:"film" OR intext:"IMDb"',
    "study": "site:researchgate.net OR site:jstor.org OR site:academia.edu",
    "social": "site:twitter.com OR site:tiktok.com OR site:instagram.com"
}

SOCIAL_MEDIA_DOMAINS = [
    'facebook.com', 'instagram.com', 'twitter.com',
    'tiktok.com', 'pinterest.com', 'reddit.com'
]


async def search_text_sources(query: str, sources: list = None):
    """Search for the original source of a text quote using SERPAPI."""
    base_query = f'"{query}"'

    if sources:
        source_filters = [SOURCE_MAPPINGS[s] for s in sources if s in SOURCE_MAPPINGS]
        if source_filters:
            base_query += " (" + " OR ".join(source_filters) + ")"

    params = {
        "engine": "google",
        "q": base_query,
        "api_key": SERPAPI_KEY,
        "num": 10
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("https://serpapi.com/search", params=params, timeout=20.0)
            resp.raise_for_status()
            return parse_text_results(resp.json())
        except Exception as e:
            raise HTTPException(500, f"Text search failed: {str(e)}")


async def reverse_image_search(
    file: UploadFile,
    search_faces: bool = True,
    search_social: bool = True
):
    """Reverse image search with optional face detection."""
    image_data = await file.read()
    image = Image.open(BytesIO(image_data))
    np_image = np.array(image)

    standard_results = await serpapi_image_search(image_data)
    if not search_social:
        standard_results = exclude_social_media(standard_results)

    output = {"standard_results": {"google": standard_results}}

    if search_faces:
        try:
            import face_recognition
            face_results = []
            face_locations = face_recognition.face_locations(np_image)

            for i, face_location in enumerate(face_locations):
                top, right, bottom, left = face_location
                face_image = image.crop((left, top, right, bottom))

                face_bytes = BytesIO()
                face_image.save(face_bytes, format='JPEG')

                face_search_results = await serpapi_image_search(face_bytes.getvalue())
                if not search_social:
                    face_search_results = exclude_social_media(face_search_results)

                face_results.append({
                    "face_index": i,
                    "position": {"top": top, "right": right, "bottom": bottom, "left": left},
                    "results": {"google": face_search_results}
                })

            output["face_results"] = face_results
        except ImportError:
            pass

    return output


async def serpapi_image_search(image_bytes: bytes):
    """Reverse image search via SERPAPI Google Lens."""
    params = {
        "engine": "google_reverse_image",
        "api_key": SERPAPI_KEY,
        "image_content": base64.b64encode(image_bytes).decode()
    }
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.get("https://serpapi.com/search", params=params, timeout=30.0)
            resp.raise_for_status()
            return parse_image_results(resp.json())
        except httpx.ReadTimeout:
            return [{"error": "Image search timed out"}]
        except Exception as e:
            return [{"error": f"Image search failed: {str(e)}"}]


def exclude_social_media(results):
    """Remove social media sites from a results list."""
    if not isinstance(results, list):
        return results
    filtered = [
        r for r in results
        if not any(domain in r.get("source", "").lower() for domain in SOCIAL_MEDIA_DOMAINS)
    ]
    return filtered if filtered else results


def parse_text_results(data):
    return [
        {
            "title": item.get("title"),
            "url": item.get("link"),
            "snippet": item.get("snippet"),
            "source": item.get("displayed_link")
        }
        for item in data.get("organic_results", [])
    ]


def parse_image_results(data):
    if "error" in data:
        return [{"error": data["error"]}]

    items = data.get("image_results") or data.get("inline_images") or []
    if not items:
        return [{"error": "No image results found"}]

    return [
        {
            "title": item.get("title") or "Image result",
            "url": item.get("link") or item.get("original"),
            "thumbnail": item.get("thumbnail"),
            "source": item.get("source") or item.get("displayed_link") or "Unknown"
        }
        for item in items[:10]
    ]
