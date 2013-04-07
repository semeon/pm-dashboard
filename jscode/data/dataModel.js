function DataModel(){

  var self = this;
  this.responseJson = {}; // JSON

}
  
  /*
  https://redmine.firstlinesoftware.com/issues.json?project_id=isori&limit=2

  
  issues: [{
    start_date: "2011-12-06",
    estimated_hours: 368.5,
    author: {
      name: "Alexey Kutuzov",
      id: 64
    },
    created_on: "2011-12-06T08:31:50Z",
    priority: {
      name: "Immediate",
      id: 7
    },
    id: 5624,
    updated_on: "2012-07-13T05:50:51Z",
    project: {
      name: "Loyalty FPK",
      id: 54
    },
    subject: "00 Внутренние задачи",
    done_ratio: 95,
    tracker: {
      name: "Requirement",
      id: 6
    },
    due_date: "2012-06-06",
    custom_fields: [{
      name: "Sprint",
      id: 4,
      value: ""
    }],
    description: "",
    status: {
      name: "New",
      id: 1
    }
  },
  {
    author: {
      name: "Semeon Peradze",
      id: 175
    },
    created_on: "2012-02-15T05:28:55Z",
    priority: {
      name: "Normal",
      id: 4
    },
    id: 7471,
    updated_on: "2012-06-22T12:57:25Z",
    project: {
      name: "Loyalty FPK",
      id: 54
    },
    subject: "ZZ Test Issues",
    done_ratio: 0,
    tracker: {
      name: "Requirement",
      id: 6
    },
    custom_fields: [{
      name: "Sprint",
      id: 4,
      value: ""
    }],
    description: "",
    status: {
      name: "New",
      id: 1
    }
  }],
  total_count: 419,
  limit: 2,
  offset: 0

  */
