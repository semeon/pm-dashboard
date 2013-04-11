function Settings() {

	var self = this;

	this.userSettings = {
	    queryURL: 'http://dintrsrv01.domain.corp/issues',
	    userKey: '2da4605ebea54748909b946d3c9d2bd5c04c4837',
	    projects: [
	      { id: 'isori',
	        title: 'FPK Loyalty',
	        queryTitles: ['In Development', 'Ready for Deploy', 'Ready for QA', 'Total'],
	        versions: [
	          { version: '9.0', 
	            queries: [           '464',              '462',          '463',   '461']
	          },
	          { version: '9.1', 
	            queries: [           '519',              '520',          '521',   '502']
	          },
	          { version: '10.0', 
	            queries: [           '515',              '516',          '517',   '505']
	          }
	        ],
			issueTrackers: [1, 2, 10],
			customStatuses: [
				{title: 'Development', 	includes: [1, 2, 19]},
				{title: 'Testing', 		includes: [3, 6, 18]},
				{title: 'Blocked', 		includes: [4, 14]},
				{title: 'Done', 		includes: [5]}
			]
	      }
	      ,

	      { id: 'fpkloyalfeedback',
	        title: 'FPK Loyalty External',
	        queryTitles: ['Total' ],
	        versions: [
	          { version: '10.0', 
	            queries: ['377']
	          }
	        ],
			issueTrackers: [1, 2, 10],
			customStatuses: [
				{title: 'Development', 	includes: [1, 2, 19]},
				{title: 'Testing', 		includes: [3, 6, 18]},
				{title: 'Blocked', 		includes: [4, 14]},
				{title: 'Done', 		includes: [5]}
			]
	      }
	      ,

	  //     { id: 'rsalfr',
	  //       title: 'RS Alfresco',
	  //       queryTitles: ['Total' ],
	  //       versions: [
	  //         { version: '2.0', 
	  //           queries: ['435']
	  //         },
	  //         { version: '3.0', 
	  //           queries: ['434']
	  //         }
	  //       ],
			// issueTrackers: [1, 2, 10],
			// customStatuses: [
			// 	{title: 'Development', 	includes: [1, 2, 19]},
			// 	{title: 'Testing', 		includes: [3, 6, 18]},
			// 	{title: 'Blocked', 		includes: [4, 14]},
			// 	{title: 'Done', 		includes: [5]}
			// ]
	  //     }
	  //     ,

	  //     { id: 'fpkloyalwebsrv',
	  //       title: 'Test Project Title',
	  //       queryTitles: ['Total' ],
	  //       versions: [],
			// issueTrackers: [1, 2, 10],
			// customStatuses: [
			// 	{title: 'Development', 	includes: [1, 2]},
			// 	{title: 'Done', 		includes: [5]}
			// ]
	  //     }
	      


	    ],
	    
    },


	this.appSettings = {
		appStatus: 'testing'
	},

	this.redmineSettings = {
		userKey:            '2da4605ebea54748909b946d3c9d2bd5c04c4837',
		redmineUrl:         'http://dintrsrv01.domain.corp/',

		// parametered urls
		projectsRequestUrl: 'projects',
		issuesRequestUrl:   'issues',
		queriesRequestUrl:  'queries',

		// project-based urls
		projectDataUrl:     'projects/',
		versionsRequestUrl:  'versions',

		issueStatuses: [
			{id: 1,  name: "New"},
			{id: 2,  name: "In Progress"},
			{id: 3,  name: "Resolved"},
			{id: 4,  name: "Need More Info"},
			{id: 5,  name: "Closed"},
			{id: 6,  name: "Rejected"},
			{id: 7,  name: "Final"},
			{id: 8,  name: "In Development"},
			{id: 9,  name: "Delivered"},
			{id: 10, name: "Accepted"},
			{id: 11, name: "Final - Signed"},
			{id: 12, name: "Uploaded"},
			{id: 13, name: "Definition in Process"},
			{id: 14, name: "On Hold"},
			{id: 15, name: "Cancelled"},
			{id: 16, name: "Final - Estimated"},
			{id: 17, name: "Pending Acceptance"},
			{id: 18, name: "Not Reproduced"},
			{id: 19, name: "Reopened"}
		],

		issueTrackers: [
			{id: 1,  name: "Bug"},
			{id: 2,  name: "Feature"},
			{id: 4,  name: "Task"},
			{id: 6,  name: "Requirement"},
			{id: 5,  name: "Change request"},
			{id: 7,  name: "CR"},
			{id: 9,  name: "ADJ"},
			{id: 10, name: "Question"}
		],

		responseLimit: 100, // Redmine never return more than 100

		jsonRequestModifier: '.json'
	}

	// -------------------------------------------------------------------
	// Methods -----------------------------------------------------------
	// -------------------------------------------------------------------
	this.userSettings.getProjectSettingsById = function (projectId) {
		console.log('UserSettings: Project by ID requested. Id: ' + projectId);

		for(var i=0; i<self.userSettings.projects.length; i++) {
			if ( self.userSettings.projects[i].id == projectId ) {
				console.log('  Returned: ' + self.userSettings.projects[i].title);
				return self.userSettings.projects[i];
			}
		}
		console.log('  Returned: ' + undefined);
		return undefined;
	}



	// Full list of statuses:
	// 'New', 'In Progress', 'Definition in Process', 'Resolved', 'Rejected', 'Final', 'Final - Estimated', 'Final - Signed',
	// 'In Development', 'Uploaded', 'Delivered', 'Reopened', 'Need More Info', 'Pending Acceptance', 'Accepted', 'Not Reproduced',
	// 'On Hold', 'Closed', 'Cancelled'

	// 'New', 'In Progress', 'Resolved', 'Rejected', 'In Development', 'Reopened', 'Need More Info', 'On Hold', 'Closed'

}
