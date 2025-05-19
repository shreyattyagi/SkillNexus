from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import datetime

def create_pdf_report(filename: str, analysis_data: dict) -> str:
    # Create a unique filename for the PDF
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"reports/resume_analysis_{timestamp}.pdf"
    
    # Create the document
    doc = SimpleDocTemplate(pdf_filename, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12
    )
    
    # Build the document content
    content = []
    
    # Title
    content.append(Paragraph("Resume Analysis Report", title_style))
    content.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))
    content.append(Spacer(1, 20))
    
    # ATS Analysis
    if "ats_analysis" in analysis_data:
        ats = analysis_data["ats_analysis"]
        content.append(Paragraph("ATS Analysis", heading_style))
        
        # Scores table
        scores_data = [
            ["Metric", "Score"],
            ["Overall ATS Score", f"{ats['overall_ats_score']}%"],
            ["Format Score", f"{ats['format_score']}%"],
            ["Skills Score", f"{ats['skills_score']}%"]
        ]
        
        if ats.get('job_match_score') is not None:
            scores_data.append(["Job Match Score", f"{ats['job_match_score']}%"])
        
        scores_table = Table(scores_data, colWidths=[3*inch, 2*inch])
        scores_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        content.append(scores_table)
        content.append(Spacer(1, 20))
        
        # Format Analysis
        content.append(Paragraph("Resume Format Analysis", heading_style))
        format_data = [["Section", "Status"]]
        for section, present in ats["format_analysis"].items():
            format_data.append([section.replace("has_", "").title(), "✓" if present else "✗"])
        
        format_table = Table(format_data, colWidths=[3*inch, 2*inch])
        format_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        content.append(format_table)
        content.append(Spacer(1, 20))
    
    # Skills Analysis
    if "extracted_skills" in analysis_data:
        content.append(Paragraph("Skills Analysis", heading_style))
        skills_text = ", ".join(analysis_data["extracted_skills"])
        content.append(Paragraph(f"Detected Skills: {skills_text}", styles["Normal"]))
        content.append(Spacer(1, 20))
    
    # Job Match Analysis
    if "job_title" in analysis_data:
        content.append(Paragraph("Job Match Analysis", heading_style))
        content.append(Paragraph(f"Job Title: {analysis_data['job_title']}", styles["Normal"]))
        content.append(Spacer(1, 10))
        
        if "match_percentage" in analysis_data:
            content.append(Paragraph(f"Overall Match: {analysis_data['match_percentage']}%", styles["Normal"]))
            content.append(Spacer(1, 10))
        
        if "missing_skills" in analysis_data and analysis_data["missing_skills"]:
            content.append(Paragraph("Missing Skills:", styles["Normal"]))
            missing_skills = ", ".join(analysis_data["missing_skills"])
            content.append(Paragraph(missing_skills, styles["Normal"]))
            content.append(Spacer(1, 10))
    
    # Improvement Suggestions
    if "ats_analysis" in analysis_data and "improvement_suggestions" in analysis_data["ats_analysis"]:
        content.append(Paragraph("Improvement Suggestions", heading_style))
        for suggestion in analysis_data["ats_analysis"]["improvement_suggestions"]:
            content.append(Paragraph(f"• {suggestion}", styles["Normal"]))
    
    # Build the PDF
    doc.build(content)
    return pdf_filename 