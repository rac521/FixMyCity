def calculate_risk_score(issue_type: str, duplicate_count: int, location_type: str) -> dict:
    """
    Calculates a risk score based on inputs.
    """
    base_scores = {
        "water leakage": 40,
        "road damage": 50,
        "pothole": 30,
        "broken streetlight": 20,
        "garbage overflow": 15,
        "sanitation issue": 45
    }
    
    # Base score based on issue type
    score = base_scores.get(issue_type, 20)
    
    # Add points for duplicates (more duplicates = higher severity)
    score += min(duplicate_count * 5, 25)
    
    # Location modifiers
    if location_type == "high_traffic":
        score += 20
    elif location_type == "school_zone":
        score += 30
    elif location_type == "hospital_zone":
        score += 35
        
    # Cap score at 100
    risk_score = min(max(int(score), 0), 100)
    
    # Determine severity level
    if risk_score <= 30:
        severity_level = "LOW"
    elif risk_score <= 70:
        severity_level = "MEDIUM"
    else:
        severity_level = "HIGH"
        
    return {
        "risk_score": risk_score,
        "severity_level": severity_level
    }
