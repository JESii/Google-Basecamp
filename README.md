BaseCamp access routines for Google Docs
========================================

This project provides the ability to import data from Basecamp into a Google document, such as a spreadsheet. 
It is proof-of-concept developed for a client in 2010: they wanted to be able to display a project dashboard of their BaseCamp project. 
The prototype worked, but in the end, they decided to use a different platform for their project tracking.

This contains the JavaScript code for accessing the BaseCamp API from Google Docs. It uses the Basecamp Classic API.

## Version
V1.06.00 2010-11-06
Cleaned up for public distribution 2013-10-03

## Public Functions Available

/*** Documentation
 * basecamp_list_dashboard()
 *  RETURNS:
 *  	[0] project_name
 *  	[1] responsible_party_name
 *  	[2] milestone   (optional)
 *  	[3] ToDo List
 *  	[4] ToDo Item
 *  	[5] Due Date
 *  	[6] Completed? [true/false]
 *  	[7] Number of comments
 *
 * basecamp_list_milestones()
 *  RETURNS:
 *  	[0] milestone_ID
 *  	[1] title
 *  	[2] project_ID
 *  	[3] deadline
 *  	[4] completed [true/false]
 *  	[5] responsible_party_ID
 *  	[6] responsible_party_name
 *
 * basecamp_list_people()
 *  RETURNS:
 *      person_ID
 *      person_name
 *
 * basecamp_list_todos(person)
 *  RETURNS:
 *  Returns an array with information about 1 person if:
 *    person    - has a valid person_ID
 *  or all people in the database
 *    person    - is blank/omitted or is "ALL"
 *  DATA:
 *  	[0] todo_list_name
 *  	[1] todo_item_desription
 *  	[2] due_date
 *  	[3] completed? [true/false]
 *  	[4] comments_count
 *  	[5] project_ID
 *  	[6] responsible_party_ID
 *  	[7] milestone_ID    (optional)
 *
 * basecamp_list_projects()
 *  RETURNS:
 *      project_ID
 *      project_name
 *      company_name
 *
 * basecamp_list_action_items()
 *  RETURNS:
 *      description
 *      owner (responsible_party)
 *      status
 *      due date
 *      last (most recent) comment
 */

## Proof-of-concept developed by Jon Seidel / EDP Consulting, Inc.

