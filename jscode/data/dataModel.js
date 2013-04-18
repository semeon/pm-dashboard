function DataModel (userSettings) {

    var self = this;

    this.projects = {};


    this.getIssueGroup = function (version, groupName) {

    }


	// Calculate data statistics
	// ---------------------------------------------------------------------------
    this.calculateStatistics = function (project, version) {

		console.log('Gatehring statistics for ' + project.id + ' / ' + version.name);

		var issues = version.sourceIssues;

		for (var i=0; i<issues.length; i++) {
			var issue = issues[i];
			console.log('------------------------------------------------------');
			console.log('Processing issue[' + i + '] #' + issue.id);

			var issueStatus = issue.status.id;
			var issueTracker = issue.tracker.id;

			// var tracker = version.issuesByTracker[issueTracker];
			// if (tracker == undefined) {}

			console.log('- Checking tracker and status..');
			if ( $.inArray(issueTracker, project.issueTrackers) > -1 
					&&
				 $.inArray(issueStatus, project.supportedStatuses) > -1 ) {

				console.log('-- Good. Status: ' + issueStatus + ', tracker:  '+ issueTracker + '. Proceeding..');

				// All valid issues
				// ---------------------------------------------------
					console.log('--- Pushing to all issues list and hash map');
					version.issues.push(issue);
					version.issuesMap[String(issue.id)] = issue;


				// Collecting trackers
				// ---------------------------------------------------
					console.log('--- Pushing to issueTrackers with id: ' + issueTracker);
					version.issueTrackers[issueTracker].count++;
					version.issueTrackers[issueTracker].issues.push(issue);


				// Collecting statuses
				// ---------------------------------------------------
					console.log('--- Pushing to issueStatuses with id: ' + issueStatus);
					version.issueStatuses[issueStatus].count++;
					version.issueStatuses[issueStatus].issues.push(issue);


				// Collecting custom status groups
				// ---------------------------------------------------
					var issueGroupname = getIssueGroupName(issueStatus);
					console.log('--- Pushing to issueGroup: ' + issueGroupname);
					version.issueGroups[issueGroupname].count++;
					version.issueGroups[issueGroupname].issues.push(issue);


			} else {
				console.log('-- Doesn\'t fit. Next..');
			}
		}

		function getIssueGroupName (statusId) {
			console.log('---- getIssueGroupName requested for staus ID: ' + statusId);
			for (var cs=0; cs<project.customStatuses.length; cs++ ) {
				var groupName = project.customStatuses[cs].title;
				if ( $.inArray(statusId, project.customStatuses[cs].includes) > -1 ) {
					issueGroupname = groupName;

					console.log('----- Return: ' + issueGroupname);
					return issueGroupname;
				}
			}
		}

    }


	// Create a new version
	// ---------------------------------------------------------------------------
    this.createVersion = function (project, versionJson) {
        console.log('New version creation requested for ' + project.id + ': ' + versionJson.id);

        var version = project.versions[versionJson.id];
        if(version != undefined) {
            console.log('- Version already exists. Deleting..');
            version = {};
        }

        console.log('- Creating..');

        version = versionJson;
        project.versions[String(version.id)] = version;
        version.sourceIssues = [];
        version.issues = [];
        version.issuesMap = {};
        version.issueGroups = {};
        version.issueTrackers = {};
        version.issueStatuses = {};

        // Predefine custom statuses
        // ----------------------------------------------------------
		for (var cs=0; cs<project.customStatuses.length; cs++ ) {
			var groupName = project.customStatuses[cs].title;
			version.issueGroups[groupName] = {};
			version.issueGroups[groupName].title = groupName;
			version.issueGroups[groupName].count = 0;
			version.issueGroups[groupName].issues = [];
		}            

		// Predefine tracker groups
		// ----------------------------------------------------------
		for (var it=0; it<project.issueTrackers.length; it++ ) {
			
			var trackerId = String(project.issueTrackers[it]);
			version.issueTrackers[trackerId] = {};
			version.issueTrackers[trackerId].count = 0;
			version.issueTrackers[trackerId].issues = [];
		}            

		// Predefine status groups
		// ----------------------------------------------------------
		console.log('-- Creating custom status groups.. Count: ' + project.customStatuses.length);
		for (var cs=0; cs<project.customStatuses.length; cs++ ) {
			var customStatus = project.customStatuses[cs];

			console.log('-- Creating custom status group ' + cs + ' of ' + project.customStatuses.length +  ': ' + customStatus.title);

			for (var is=0; is<customStatus.includes.length; is++) {
				var statusId = String(customStatus.includes[is]);

				console.log('--- Adding a status, step ' + is + ' of ' + customStatus.includes.length + ', ID: ' + statusId);

				version.issueStatuses[statusId] = {};
				version.issueStatuses[statusId].count = 0;
				version.issueStatuses[statusId].issues = [];
			}
		}            

		// Public Methods
		// ----------------------------------------------------------
		version.getIssueCountByStatusGroup = function(statusName) {
			var includedStatuses = project.customStatuses[statusName].includes;

			for (var cs=0; cs<project.customStatuses.length; cs++ ) {

				var cs = project.customStatuses[cs];
				var customStatusCount = 0;

				for (is in cs.includes) {
					var statusId = String(cs[is]);
					customStatusCount = customStatusCount + version.issueStatuses[statusId].count;
				}
			}            
		}

        return version;
    }


	// Create a new project
	// ---------------------------------------------------------------------------
    this.createProject = function (userProject) {
        console.log('New project creation requested: ' + userProject.id);

        var project = self.projects[userProject.id];

        if(project == undefined) {
            console.log('  Creating..');
            // ------------------------------

            project = {};
            self.projects[userProject.id] = project;

            project.id = userProject.id;
            project.title = userProject.title;
            project.versions = {};
            project.allIssues = [];
            project.customStatuses = userProject.customStatuses;
            project.issueTrackers = userProject.issueTrackers;
            project.customQueries = userProject.customQueries;

    		project.supportedStatuses = [];
		    for (var cs=0; cs<project.customStatuses.length; cs++) {
		        project.supportedStatuses = project.supportedStatuses.concat(project.customStatuses[cs].includes);
		    }

        } else {
            console.log('  Warning! Project already exists.');
        }

        return project;
    }


}