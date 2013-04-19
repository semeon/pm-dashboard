function Settings() {

	var self = this;

	// console.log = function() {}

	this.userSettings = {
	    queryURL: 'http://dintrsrv01.domain.corp/issues',
	    userKey: '',
	    projects: [

	    // ПРИМЕР НАСТРОЙКИ ПРОЕКТА
		// { 
		// 	ID проекта, такой как в редмайне
		// 	id: 'isori', 				
		
		// 	название проекта, каким будет отображаться на странице
		// 	title: 'FPK Loyalty',
		
		// 	ID трекеров, которые вас интересуют
		// 		Например: 1 - Bug, 2 - Feature
		// 		Все трекеры ниже в Redmine Settings
		// 	issueTrackers: [1, 2, 10], 

		// 	Группы статусов, по которым собирается статистика
		// 		"title" - их названия
		// 		"includes" - статусы редмайна, которые следует включать в группы
		// 			Например, 1 - New, 2 - In Progress
		// 			Все статусы ниже в Redmine Settings
		// 	customStatuses: [
		// 						{title: 'Development', 	includes: [1, 2, 19]},
		// 						{title: 'Testing', 		includes: [3, 6, 18]},
		// 						{title: 'Blocked', 		includes: [4, 14]},
		// 						{title: 'Done', 		includes: [5]}
		// 					]
		// },

	      { 
	      	id: 'isori', 				
	        title: 'FPK Loyalty',
			issueTrackers: [1, 2, 10], 
			customStatuses: [
				{title: 'Dev', 	includes: [1, 2, 19]},
				{title: 'Testing', 		includes: [3, 6, 18]},
				{title: 'Blocked', 		includes: [4, 14]},
				{title: 'Done', 		includes: [5]}
			],
			customQueries: [
				{id: 515, title: '10.0: In Development'},
				{id: 516, title: '10.0: Ready for Deploy'},
				{id: 517, title: '10.0: Ready for QA'}
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
				{title: 'Not Started', 	includes: [1]},
				{title: 'In Progress', 	includes: [2, 19, 6, 18]},
				{title: 'Blocked', 		includes: [4, 14]},
				{title: 'Done', 		includes: [3, 5, 15]}
			]
	      }
	  //     ,
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


	this.redmineSettings = {
	    // Домен редмайн
		redmineUrl:         'http://dintrsrv01.domain.corp/',

	    // Это ключ, который позволяет вам не логиниться в редмайн
		userKey:            '',


		// parametered urls
		projectsRequestUrl: 'projects',
		issuesRequestUrl:   'issues',
		queriesRequestUrl:  'queries',

		// project-based urls
		projectDataUrl:     'projects/',
		versionsRequestUrl:  'versions',

		issueStatuses: [ // DEPRECATED - DO NOT USE
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
		issueStatusesMap: {
			'1':  {id: 1,  name: "New"},
			'2':  {id: 2,  name: "In Progress"},
			'3':  {id: 3,  name: "Resolved"},
			'4':  {id: 4,  name: "Need More Info"},
			'5':  {id: 5,  name: "Closed"},
			'6':  {id: 6,  name: "Rejected"},
			'7':  {id: 7,  name: "Final"},
			'8':  {id: 8,  name: "In Development"},
			'9':  {id: 9,  name: "Delivered"},
			'10': {id: 10, name: "Accepted"},
			'11': {id: 11, name: "Final - Signed"},
			'12': {id: 12, name: "Uploaded"},
			'13': {id: 13, name: "Definition in Process"},
			'14': {id: 14, name: "On Hold"},
			'15': {id: 15, name: "Cancelled"},
			'16': {id: 16, name: "Final - Estimated"},
			'17': {id: 17, name: "Pending Acceptance"},
			'18': {id: 18, name: "Not Reproduced"},
			'19': {id: 19, name: "Reopened"}
		},


		issueTrackers: [ // DEPRECATED - DO NOT USE
			{id: 1,  name: "Bug"},
			{id: 2,  name: "Feature"},
			{id: 4,  name: "Task"},
			{id: 6,  name: "Requirement"},
			{id: 5,  name: "Change request"},
			{id: 7,  name: "CR"},
			{id: 9,  name: "ADJ"},
			{id: 10, name: "Question"}
		],
		issueTrackersMap: {
			'1':  {id: 1,  name: "Bug"},
			'2':  {id: 2,  name: "Feature"},
			'4':  {id: 4,  name: "Task"},
			'5':  {id: 5,  name: "Change request"},
			'6':  {id: 6,  name: "Requirement"},
			'7':  {id: 7,  name: "CR"},
			'9':  {id: 9,  name: "ADJ"},
			'10': {id: 10, name: "Question"}
		},

		responseLimit: 100, // Redmine never return more than 100

		jsonRequestModifier: '.json'
	}

	this.appSettings = {
		appStatus: 'testing'
	},

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
