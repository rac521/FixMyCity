import random

def check_duplicate(latitude: float, longitude: float, image_bytes: bytes = None) -> dict:
    """
    Mock duplicate detection.
    In reality, we would query the database for complaints within 50-100m,
    and then compare image perceptual hashes (pHash) to confirm.
    """
    
    # For a hackathon demo, we can simulate a duplicate based on specific coordinates
    # or just return false by default, or with a small chance of being true.
    # We will use random chance to demonstrate the functionality: 10% chance of duplicate
    
    is_duplicate = random.random() < 0.10
    
    if is_duplicate:
        # Mock duplicate complaint ID
        duplicate_id = random.randint(1, 100)
        similarity_score = round(random.uniform(0.85, 0.98), 2)
        
        return {
            "is_duplicate": True,
            "duplicate_complaint_id": str(duplicate_id),
            "similarity_score": similarity_score
        }
    else:
        return {
            "is_duplicate": False,
            "duplicate_complaint_id": None,
            "similarity_score": 0.0
        }
