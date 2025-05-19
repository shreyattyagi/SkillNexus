from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from datetime import datetime
import os

def generate_resume(job_role: str, resume_data: dict) -> str:
    # Create a unique filename for the PDF
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"reports/resume_{resume_data['personalInfo']['fullName'].replace(' ', '_')}_{timestamp}.pdf"
    
    # Create the document
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=12,
        spaceAfter=6,
        textColor=colors.HexColor('#2563eb')  # Blue color
    )
    normal_style = styles['Normal']
    
    # Build content
    content = []
    
    # Header/Contact Information
    personal_info = resume_data['personalInfo']
    content.append(Paragraph(personal_info['fullName'], title_style))
    
    contact_info = []
    if personal_info['email']:
        contact_info.append(personal_info['email'])
    if personal_info['phone']:
        contact_info.append(personal_info['phone'])
    if personal_info['linkedin']:
        contact_info.append(f"LinkedIn: {personal_info['linkedin']}")
    if personal_info.get('github'):
        contact_info.append(f"GitHub: {personal_info['github']}")
    
    content.append(Paragraph(' | '.join(contact_info), ParagraphStyle(
        'ContactInfo',
        parent=styles['Normal'],
        alignment=1,
        spaceAfter=20
    )))
    
    # Professional Summary
    if personal_info['summary']:
        content.append(Paragraph('Professional Summary', heading_style))
        content.append(Paragraph(personal_info['summary'], normal_style))
        content.append(Spacer(1, 12))
    
    # Skills
    if resume_data['skills']['technical'] or resume_data['skills']['soft']:
        content.append(Paragraph('Skills', heading_style))
        
        if resume_data['skills']['technical']:
            content.append(Paragraph(
                f"<b>Technical Skills:</b> {', '.join(resume_data['skills']['technical'])}",
                normal_style
            ))
        
        if resume_data['skills']['soft']:
            content.append(Paragraph(
                f"<b>Soft Skills:</b> {', '.join(resume_data['skills']['soft'])}",
                normal_style
            ))
        
        content.append(Spacer(1, 12))
    
    # Experience
    if resume_data['experience']:
        content.append(Paragraph('Professional Experience', heading_style))
        
        for exp in resume_data['experience']:
            # Company and title
            content.append(Paragraph(
                f"<b>{exp['title']}</b> - {exp['company']}",
                ParagraphStyle('ExperienceHeader', parent=normal_style, spaceBefore=8)
            ))
            
            # Dates
            date_text = f"{exp['startDate']} - {'Present' if exp['current'] else exp['endDate']}"
            content.append(Paragraph(date_text, ParagraphStyle(
                'ExperienceDates',
                parent=normal_style,
                textColor=colors.gray
            )))
            
            # Responsibilities
            for resp in exp['responsibilities']:
                if resp.strip():
                    content.append(Paragraph(f"• {resp}", ParagraphStyle(
                        'Bullet',
                        parent=normal_style,
                        leftIndent=20,
                        spaceBefore=6
                    )))
            
            content.append(Spacer(1, 12))
    
    # Education
    if resume_data['education']:
        content.append(Paragraph('Education', heading_style))
        
        for edu in resume_data['education']:
            content.append(Paragraph(
                f"<b>{edu['degree']}</b>",
                ParagraphStyle('EducationHeader', parent=normal_style, spaceBefore=8)
            ))
            content.append(Paragraph(
                f"{edu['school']}, {edu['location']}",
                normal_style
            ))
            if edu['graduationDate']:
                content.append(Paragraph(
                    f"Graduation: {edu['graduationDate']}",
                    ParagraphStyle('EducationDate', parent=normal_style, textColor=colors.gray)
                ))
            
            content.append(Spacer(1, 12))
    
    # Projects
    if resume_data['projects']:
        content.append(Paragraph('Projects', heading_style))
        
        for project in resume_data['projects']:
            content.append(Paragraph(
                f"<b>{project['name']}</b>",
                ParagraphStyle('ProjectHeader', parent=normal_style, spaceBefore=8)
            ))
            
            if project['technologies']:
                content.append(Paragraph(
                    f"<i>Technologies:</i> {project['technologies']}",
                    normal_style
                ))
            
            if project['description']:
                content.append(Paragraph(project['description'], ParagraphStyle(
                    'ProjectDescription',
                    parent=normal_style,
                    leftIndent=20,
                    spaceBefore=6
                )))
            
            if project['link']:
                content.append(Paragraph(
                    f"Link: {project['link']}",
                    ParagraphStyle('ProjectLink', parent=normal_style, textColor=colors.blue)
                ))
            
            content.append(Spacer(1, 12))
    
    # Build the PDF
    doc.build(content)
    return filename 