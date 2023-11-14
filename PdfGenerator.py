from datetime import datetime

import pdfkit
import os
from jinja2 import Template

from models.DocumentModel import Document
from models.WorkflowModel import Workflow
from util.Constants import DocumentFields
from util.MongoDbConnection import mongodb
from util.Utility import get_dos_url, get_directive
from util.logger import logger as logging


def fill_template(path_to_file, document):
    relevant_workflow = Workflow(
        mongodb.get_workflow(document.get_workflow_id())[0]) if document.get_workflow_id() is not None else None
    template = Template(open(os.path.join(path_to_file), encoding="utf-8").read())
    expiration_date = document.get_expiration_date().strftime(
        '%Y-%m-%d') if document.get_expiration_date() is not None else ""
    issue_date = document.get_issue_date().strftime('%Y-%m-%d') if document.get_issue_date() is not None else ""
    valid_from_date = document.get_valid_from_date().strftime(
        '%Y-%m-%d') if document.get_valid_from_date() is not None else ""

    dos_url = get_dos_url()

    html = template.render(
        directive=get_directive(),
        document_name=document.get_document_name(),
        document_version=document.get_document_version(),
        document_id=document.get_document_id(),
        document_type=document.get_document_type(),
        document_url=f"https://{dos_url}/document-view-details/{document.get_document_unique_id()}/{document.get_document_version()}",
        document_unique_id=document.get_document_unique_id(),
        creator=document.get_creator_name(),
        issue_date=issue_date if issue_date is not None else "",
        valid_from_date=valid_from_date if valid_from_date is not None else "",
        expiration_date=expiration_date,
        confidentiality=document.get_data_security()[DocumentFields.CONFIDENTIALITY],
        integrity=document.get_data_security()[DocumentFields.INTEGRITY],
        availability=document.get_data_security()[DocumentFields.AVAILABILITY],
        related_departments=", ".join(document.get_related_departments_names()),
        publisher_department=document.get_publisher_department_name(),
        areas=", ".join(document.get_areas_names()),
        roles=", ".join(document.get_affected_roles_names()),
        relevant_stations=", ".join([str(item) for item in document.get_locations_names()]),
        training_deadline=f"{document.get_training_deadline()} nap" if document.get_training_deadline() != 0 else "Azonnal",
        training_method=document.get_training_method_name(),
        related_workflow_url=f"https://{dos_url}/workflow-view/{document.get_workflow_id()}" if document.get_workflow_id() is not None else None,
        related_archival_workflow_url=f"https://{dos_url}/workflow-view/{document.get_archival_workflow_id()}" if document.get_archival_workflow_id() is not None else None,
        approver_data=relevant_workflow.get_approver_data() if relevant_workflow is not None else [],
        change_reason=relevant_workflow.get_change_reason() if relevant_workflow is not None else "",
        related_documents=", ".join([f"{document['name']} ({document['id']})" for document in document.get_related_documents_names()]),
        archival_date=document.get_archived_date().strftime('%Y-%m-%d') if document.get_archived_date() is not None else None,
        products=", ".join(document.get_product_family_names()),
        date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    )

    return html


def generate_pdf(document, path_on_file_share):
    path_to_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'resources', 'pdf',
                                "cover_sheet.html")
    logging.info("Path to cover sheet template html: " + path_to_file)
    options = {
        'encoding': 'UTF-8',
        'javascript-delay': 1000,
        'no-stop-slow-scripts': None,
        "enable-local-file-access": "",
        'page-size': 'A4',
        'margin-top': '0mm',
        'margin-right': '0mm',
        'margin-bottom': '0mm',
        'margin-left': '0mm'
    }

    if type(document) is dict:
        document = Document(document)
    filled_cover_sheet = fill_template(path_to_file, document)
    logging.info("Filled cover sheet: " + filled_cover_sheet)
    cover_sheet_dest = os.path.join(path_on_file_share, "cover_sheet.pdf")
    logging.info("Path to cover sheet: " + cover_sheet_dest)
    pdfkit.from_string(filled_cover_sheet, cover_sheet_dest, options=options)