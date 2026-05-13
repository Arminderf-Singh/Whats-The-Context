from fastapi import APIRouter, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
from .search import search_text_sources, reverse_image_search

router = APIRouter()

class TextQuery(BaseModel):
    text: str
    sources: Optional[List[str]] = None

@router.post("/search/text")
async def search_text(query: TextQuery):
    results = await search_text_sources(query.text, query.sources)
    return {"results": results}

@router.post("/search/image")
async def search_image(
    file: UploadFile = File(...),
    search_faces: bool = Form(True),
    search_social: bool = Form(True)
):
    return await reverse_image_search(
        file,
        search_faces=search_faces,
        search_social=search_social
    )
