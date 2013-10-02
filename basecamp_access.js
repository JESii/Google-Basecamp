/**
 * User: jseidel
 * Date: Aug 9, 2010
 *
 * This uses the BaseCamp Classic API which was active in 2010
 * * * * * *
 * $CHANGE LOG:
 * 2010-07-22 jes   (V1.02.01): Re-sequence output of _dashboard function
 *                  - Add version number
 * 2010-07-24 jes   (V1.03.00): Add milestone information (only available by project)
 *                  - Move api token to BaseCamp object
 * 2010-07-25 jes   (V1.03.01): Final cleanup of ...get_milestones() function
 *                  - Set _loaded flags for tables.
 *                  - Rafactor xml_dump processing
 * 2010-07-26 jes   (V1.03.00): Add brute-force rate-limiting logic; max 5 requests / second
 * 2010-08-09 jes   (V1.04.00): Add documentation in preparation for other functions
 *                  - Add basecamp_list_action_items()
 * 2010-08-12 jes   (V1.05.01): Add basecamp_list_action() function
 * 2010-08-18 jes   (V1.05.02): Add todo_itemID to get_todos()... mostly for testing/reference
 * 2010-08-19 jes   (V1.05.03): Add initial get_comments() code;
 * 2010-11-06 jes   (V1.06.00): HACK; replace <body> with <commentext> to avoid Google bug
 */

BaseCamp = {
  VERSION:  "V1.06.00 2010-11-06",
  error:  false,
  people:  [],
  people_loaded:  false,
  todos:  [],
  todos_loaded:  false,
  projects:  [],
  projects_loaded:  false,
  milestones:  [],
  milestones_loaded:  false,
  dashboard:  [],
  dashboard_index:  [],
  dashboard_loaded:  false,
  comments:  [],
  comments_loaded:  false,
  xml_dump:  false,
  last_fetch_time:  new Date(),
  fetch_count:  0,
  delay:  function(delay_time) {
    // This loop will delay for about 17.5 milliseconds
    for(var n = 0; n < 10000; n++) {
      var r = new RegExp();
    }
  }
};

// Modify these two lines to add your Basecamp URL and APIToken
BaseCamp.urlRoot =  "";
BaseCamp.api_token = "";

/***
 * These are the public functions - you can use any of these in your spreadsheet
 *
 * As of Aug 2013, there is apparently still no way to share code across multiple s/sheets
 * (see https://code.google.com/p/google-apps-script-issues/issues/detail?id=40 at the bottom)
 * in spite of the new Library feature. Therefore, you still have to code your url / token in each
 * worksheet. And without ensuring that one function runs before the other, there's no obvious or
 * way to set the url/token from a public function - hardcode it for testing/demo.
 */

function basecamp_set_url_and_token(url, token) {
  BaseCamp.urlRoot = url;
  BaseCamp.api_token = token;
}
function basecamp_show_url_and_token() {
  return [["BaseCamp Info:", BaseCamp.VERSION, BaseCamp.urlRoot, BaseCamp.api_token]];
}


function basecamp_list_todos(person) {
  return [
    [BaseCamp.get_todos(person)]
    ];
}

function basecamp_list_people() {
  return [
    [BaseCamp.get_people()]
    ];
}

function basecamp_list_projects() {
  return [
    [BaseCamp.get_projects()]
    ];
}

function basecamp_list_milestones() {
  return [
    [BaseCamp.get_milestones()]
    ];
}

function basecamp_list_comments(resourceType, resourceID) {
  BaseCamp.error = false;
  return [ [ BaseCamp.get_comments(resourceType, resourceID) ] ];
}

function basecamp_dump_todos(person) {
  BaseCamp.xml_dump = true;
  var result = BaseCamp.get_todos(person);
  BaseCamp.xml_dump = false;
  return result;
}

function basecamp_dump_people() {
  BaseCamp.xml_dump = true;
  var result = BaseCamp.get_people();
  BaseCamp.xml_dump = false;
  return result;
}

function basecamp_dump_projects() {
  BaseCamp.xml_dump = true;
  var result = BaseCamp.get_projects();
  BaseCamp.xml_dump = false;
  return result;
}

function basecamp_dump_milestones() {
  BaseCamp.xml_dump = true;
  var result = BaseCamp.get_milestones();
  BaseCamp.xml_dump = false;
  return result;
}

function basecamp_dump_comments(resourceType, resourceID) {
  BaseCamp.error = false;
  BaseCamp.xml_dump = true;
  var result = BaseCamp.get_comments(resourceType, resourceID);
  BaseCamp.xml_dump = false;
  return result;
}

function basecamp_list_dashboard(person) {
  if(!person || person == "" || person == undefined) return "Must specify a person or 'ALL'";
  if (!BaseCamp.people_loaded) BaseCamp.get_people();
  if (!BaseCamp.projects_loaded) BaseCamp.get_projects();
  if (!BaseCamp.milestones_loaded) BaseCamp.get_milestones();
  if(person == "ALL") {
    //This is a hack to get the unassigned folks...
    BaseCamp.people.push(["","Unassigned"]);
  }
  BaseCamp.get_todos(person);
  var numTodos = BaseCamp.todos.length;
  var numPeople = BaseCamp.people.length;
  var numProjects = BaseCamp.projects.length;
  var numMilestones = BaseCamp.milestones.length;
  var dashboard = BaseCamp.todos;
  var dashboard_index = [];
  for(var i = 0; i < BaseCamp.todos.length; i++) {
    dashboard_index.push(BaseCamp.todos[i].slice(5,7));
  }
  for (var i = 0; i < numTodos; i++) {
    // Get the project name...
    for (var j = 0; j < numProjects; j++) {
      if (dashboard[i][5] == BaseCamp.projects[j][0]) {
        dashboard[i][5] = BaseCamp.projects[j][1];
        break;
      }
    }
    // Get the person name...
    for (var j = 0; j < numPeople; j++) {
      if (dashboard[i][6] == BaseCamp.people[j][0]) {
        dashboard[i][6] = BaseCamp.people[j][1];
        break;
      }
    }
    // Get the milestone name...
    for (var j = 0; j < numMilestones; j++){
      if (dashboard[i][7] == BaseCamp.milestones[j][0]) {
        dashboard[i][7] = BaseCamp.milestones[j][1];
        break;
      }
    }
    // We swap the last 3 elements into the first positions
    var b = dashboard[i].splice(5);
    dashboard[i] = b.concat(dashboard[i]);
  }
  BaseCamp.dashboard_loaded = true;
  BaseCamp.dashboard = dashboard;
  BaseCamp.dashboard_index = dashboard_index;

  return [
    [dashboard]
    ];
}

function basecamp_list_comments(resourceType, resourceID) {
  return [ [ BaseCamp.get_comments(resourceType, resourceID)]];
}

function basecamp_list_action_items(project_id) {
  if(!project_id || project_id == "" || project_id == undefined) return "Must specify a project id";

  if(!BaseCamp.dashboard_loaded) basecamp_list_dashboard("ALL");
  var dashboard_index_length = BaseCamp.dashboard_index.length;
  return dashboard_index_length;
  if(!BaseCamp.todos_loaded) { BaseCamp.get_todos("ALL");}
  var todos_length = BaseCamp.todos.length;
  var action_items = [];
  for(var i = 0; i < todos_length; i++) {
    if(project_id == BaseCamp.todos[i][5]) {
      // We save the found index for later access to the arrays
      action_items.push(i);
    }
  }
  if(action_items.length == 0) return [[ "None"]];
  var action_item_list = [];
  var action_items_length = action_items.length;
  for (var i = 0; i < action_items_length; i++) {
    var a, b, c, d;
    a = BaseCamp.todos[i][1];       // ToDo Item
    b = BaseCamp.todos[i][6];       // Responsible party
    c = BaseCamp.todos[i][3];       // Status [completed/not]
    if(c == false) {
      c = "Open";
    } else {
      c = "Completed";
    }
    d = BaseCamp.todos[i][2];       // Due Date
    if (BaseCamp.todos[i][4] > 0) { // Comments count...
      e = "Find last comment";
    }

    else {
      e = "None";
    }
    action_item_list.push([a,b,c,d,e]);
  }

  return [
    [ action_item_list ] ];
}

/***
 * The following functions are private and are intended for use by the public functions above
 */

// Pull data from Basecamp
BaseCamp.get = function(url) {

  var apiTokenpswd = this.api_token + ":X";
  var api_encoded = Utilities.base64Encode(apiTokenpswd);
  var api_encoded_b = "Basic " + api_encoded;
  var parameters = {
    method : "get",
    contentType : "application/xml",
    headers : {
      "Authorization" : api_encoded_b,
      "Accept" : "application/xml"}
  };
  this.fetch_count++;
  var text = UrlFetchApp.fetch(url, parameters).getContentText();
  /***
   * This simply checks if 5 url fetches were performed in less than 1 second and then
   * does a brute-force delay repeatedly until 1 second has elapsed
   **/
  if(this.fetch_count >= 5) {
    var fetch_time = new Date();
    var elapsed_time = fetch_time.getTime() - this.last_fetch_time.getTime();
    while (elapsed_time < 1000) {
      this.delay();
      fetch_time = new Date();
      elapsed_time = fetch_time.getTime() - this.last_fetch_time.getTime();
    }
    this.last_fetch_time = new Date();
    this.fetch_count = 0;
  }

  return text;
};

// Get people data from Basecamp
BaseCamp.get_people = function() {
  var people = [];
  var basecamp_url = this.urlRoot + "people.xml";
  var result = this.get(basecamp_url);
  if (this.people_loaded && this.xml_dump) return result;
  var doc = Xml.parse(result, true);
  // We now have the basic XML document; check to make sure we got something that that it's valid
  if (!doc || doc == null || doc == "" || doc == undefined) {
    return "Unable to parse XML document: \n" + txt;
  }

  // This gets us the top of the XML tree, which is the <people> array element
  var xml = doc.getElement();
  // and this gets us the person items into an array
  var peopleList = xml.getElements("person");
  var numPeople = peopleList.length;
  //return "personLists: " + peopleList + "; length: " + numPeople + "; name: " + peopleList[0].getName().getLocalName();
  for (var i = 0; i < numPeople; i++) {
    var a = peopleList[i].getElement('id').getText();
    var b = peopleList[i].getElement('first-name').getText();
    var c = peopleList[i].getElement('last-name').getText();
    var d = b + ' ' + c;
    var person = [a, d];
    people.push(person);
  }
  this.people_loaded = true;

  this.people = people;
  if (this.xml_dump) return result;
  return people;
};

// Get project data from Basecamp
BaseCamp.get_projects = function() {
  var projects = [];
  var basecamp_url = this.urlRoot + "projects.xml";
  var result = this.get(basecamp_url);
  if (this.projects_loaded && this.xml_dump)return result;
  var doc = Xml.parse(result, true);
  // We now have the basic XML document; check to make sure we got something that that it's valid
  if (!doc || doc == null || doc == "" || doc == undefined) {
    return "Unable to parse XML document: \n" + txt;
  }

  // This gets us the top of the XML tree, which is the <projects> array element
  var xml = doc.getElement();
  // and this gets us the project items into an array
  var projectsList = xml.getElements("project");
  var numProjects = projectsList.length;
  for (var i = 0; i < numProjects; i++) {
    var a = projectsList[i].getElement('id').getText();
    var b = projectsList[i].getElement('name').getText();
    var company = projectsList[i].getElement('company');
    var companyName = company.getElement('name').getText();
    var project = [a, b, companyName];
    projects.push(project);
  }
  this.projects_loaded = true;

  this.projects = projects;
  if (this.xml_dump) return result;
  return projects;
};

// Get milestone data from Basecamp
BaseCamp.get_milestones = function() {
  if (!this.projects_loaded) this.get_projects();
  var milestones = [];
  var numProjects = this.projects.length;
  for (var p = 0; p < numProjects; p++) {
    var projectID = this.projects[p][0];
    var basecamp_url = this.urlRoot + "projects/" + projectID + "/milestones/list.xml";
    var result = this.get(basecamp_url);
    if (this.milestones_loaded && this.xml_dump)return result;
    var doc = Xml.parse(result, true);
    // We now have the basic XML document; check to make sure we got something that that it's valid
    if (!doc || doc == null || doc == "" || doc == undefined) {
      return "Unable to parse XML document: \n" + txt;
    }

    // This gets us the top of the XML tree, which is the <milestones> array element
    var xml = doc.getElement();
    //and this gets us the milestone items into an array
    var milestonesList = xml.getElements("milestone");
    var numMilestones = milestonesList.length;
    for (var i = 0; i < numMilestones; i++) {
      var milestone = [];
      milestone.push(milestonesList[i].getElement('id').getText());
      milestone.push(milestonesList[i].getElement('title').getText());
      milestone.push(projectID);
      milestone.push(milestonesList[i].getElement('deadline').getText());
      milestone.push(milestonesList[i].getElement('completed').getText());
      milestone.push(milestonesList[i].getElement('responsible-party-id').getText());
      milestone.push(milestonesList[i].getElement('responsible-party-name').getText());
      milestones.push(milestone);
    }

  }
  this.milestones_loaded = true;
  this.milestones = milestones;
  if (this.xml_dump) return result;
  return milestones;
};

// This function loads and returns the todo-list for one person
BaseCamp.get_one_todo_list = function(person) {
  var itemEntry = [];
  var itemEntries = [];
  var basecamp_url = this.urlRoot + "todo_lists.xml?responsible_party=" + person;
  var result = this.get(basecamp_url);
  if (this.todos_loaded && this.xml_dump)return result;
  var doc = Xml.parse(result, true);
  // We now have the basic XML document; check to make sure we got something that that it's valid
  if (!doc || doc == null || doc == "" || doc == undefined) {
    return "Unable to parse XML document: \n" + txt;
  }
  // NB: This came from the sample "Kevin Bacon" script, but I can't find documentation for spellcheck
  var attr = doc.spellcheck;
  if (attr) {
    return "Cannot find todos: " + attr.name;
  }

  // This gets us the top of the XML tree, which in this case is the <todo-list> array entry
  var xml = doc.getElement();
  // And this gets us the <todo-list> items into an array
  var todoLists = xml.getElements("todo-list");
  var numLists = todoLists.length;
  if (numLists == 0) {
    return [['No todoLists to process for: ' + person,"N/A","N/A","N/A","N/A","N/A",person]];
  }

  // itemEntries[] will contain all the todo items that are extracted
  // Now walk through each todoList...
  for (var i = 0; i < numLists; i++) {
    var listDescription = todoLists[i].getElement('description').getText();
    var listProjectID = todoLists[i].getElement('project-id').getText();
    var listTodoListName = todoLists[i].getElement('name').getText();
    var listMilestoneID = todoLists[i].getElement('milestone-id').getText();

    /*** Each todo-list array may have multiple todo-item entries...
     *   ... But they are contained in a single todo-items array
     *   So we get that one item and pick off the todo-item entries
     */
    var todoItems = todoLists[i].getElements('todo-items');
    var numItems = todoItems.length;
    var items = todoItems[0].getElements("todo-item");
    /*** This returns a single todo-item entry
      return 'items element name: ' + items[0].getName().getLocalName();
     **/
    if (items == null || items.length == 0) continue;
    var numItems = items.length;
    // itemEntry will contain a single set of todo data with multiple items
    for (var j = 0; j < numItems; j++) {

      var item = items[j];
      if (item == null) {
        return 'item is null?!!!';
      }
      var content = item.getElement('content').getText();
      var dueDate = item.getElement("due-at").getText();
      var responsiblePartyID = item.getElement("responsible-party-id").getText();
      var todoID = item.getElement("id").getText();
      var dateString;
      if (!dueDate || dueDate == null || dueDate == undefined) {
        dateString = "";
      }
      else {
        dateString = dueDate.split('T')[0];
      }
      var completed = item.getElement("completed").getText();
      var commentsCount = item.getElement("comments-count").getText();
      if (content == null || content.length == 0) {
        return 'null content from the todoList item: ' + content + '/' + content.length;
      }
      itemEntry = [listTodoListName, content, dateString, completed, commentsCount, listProjectID, responsiblePartyID, listMilestoneID, todoID ];
      itemEntries.push(itemEntry);
    }
  }

  this.todos = itemEntries;
  if (this.xml_dump) return result;
  return itemEntries;
};

// Get todos from Basecamp
BaseCamp.get_todos = function(person) {
  if (person == null || person == "") {
    person = "ALL";
  }

  // This is the code that selects all the people and then loads their individual todo-list entries
  var allEntries = [];
  if (person == 'ALL') {
    if (!this.people.loaded) this.get_people();
    var nP = this.people.length;
    for (var i = 0; i < nP; i++) {
      //return "ALL person: " + this.people[i][0];
      var oneEntry = this.get_one_todo_list(this.people[i][0]);
      //return [ [oneEntry] ];
      var j = oneEntry.length;
      if (j > 0) {
        for (var k = 0; k < j; k++) {
          allEntries.push(oneEntry.pop());
        }
      }
      // @DO - Still need to get unassigned tasks...
    }
  }
  else {
    allEntries = this.get_one_todo_list(person);
  }
  this.todos = allEntries;
  this.todos_loaded = true;
  return allEntries;

};

// Get comments from Basecamp for a given resource
BaseCamp.get_comments = function(resourceType, resourceID) {
  this.comments_loaded = false;
  /***
   * resourceType can be: todo_items, posts, milestones
   * parentID is the 'owner ID' of the comments
   */
  var comments = [];
  switch(resourceType) {
    case 'todo_items':
      break;
    case 'milestones':
      break;
    case 'posts':
      break;
    default:
      this.error = true;
      return "Invalid resource Type";
  }

  var basecamp_url = this.urlRoot + resourceType + '/' + resourceID + "/comments.xml";
  var result = this.get(basecamp_url);
  // Replace <body> with <commentext> to avoid Google bug
  result = result.replace(/<body>/gi, "<commentext>");
  result = result.replace(/<\/body>/gi, "</commentext>");
  if(this.xml_dump) return result;
  var doc = Xml.parse(result, true);
  if(!doc || doc == null || doc == "" || doc == undefined) return "Unable to parse comments XML";
  var xml = doc.getElement();
  var commentsList = xml.getElements("comment");
  var numComments = commentsList.length;
  for(var i = 0; i < numComments; i++) {
    var a = commentsList[i].getElement('id').getText();
    var b = commentsList[i].getElement('author-id').getText();
    var c = commentsList[i].getElement('author-name').getText();
    var d = commentsList[i].getElement('commentext').getText();
    comments.push([a,b,c,d]);
  }

  this.comments = comments;
  this.comments_loaded = true;
  return comments;
};

/*** Documentation
 * basecamp_list_dashboard()
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
 *  	[0] milestone_ID
 *  	[1] title
 *  	[2] project_ID
 *  	[3] deadline
 *  	[4] completed [true/false]
 *  	[5] responsible_party_ID
 *  	[6] responsible_party_name
 *
 * basecamp_list_people()
 *      person_ID
 *      person_name
 *
 * basecamp_list_todos(person)
 *  Returns an array with information about 1 person if:
 *    person    -   has a valid person_ID
 *  or all people in the database
 *    person    - is blank/omitted or "ALL"
 *  DATA:
 *  	[0] todo_list_name
 *  	[1] todo_item_desription
 *  	[2] due_date
 *  	[3] completed? [true/false]
 *  	[4] comments_count
 *  	[5] project_ID
 *  	[6] responsible_party_ID
 *  	[7] milestone_ID    (optional)
 *      [8] todo_item_ID
 *
 * basecamp_list_projects()
 *      project_ID
 *      project_name
 *      company_name
 *
 * basecamp_list_action_items()
 *      description
 *      owner (responsible_party)
 *      status
 *      due date
 *      last (most recent) comment
 */
