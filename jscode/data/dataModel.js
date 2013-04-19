function DataModel (userSettings) {

    var self = this;

    this.projects = {};


	// Calculate data statistics
	// ---------------------------------------------------------------------------
    this.calculateStatistics = function (project, version) {

		console.log('Gathering statistics for ' + project.id + ' / ' + version.name);
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


		// Public Methods
		// ----------------------------------------------------------

			version.getCustomStatusCount = function (statusName) {
				console.log('getCustomStatusCount requested for ' + project.id + ' / ' + this.name  + ' / ' +  statusName);
				var result = this.issueGroups[statusName].count;
				console.log('- Result: ' + result);
				return result;
			}
			version.getCustomStatusIssues = function (statusName) {
				console.log('getCustomStatusIssues requested for ' + project.id + ' / ' + this.name  + ' / ' +  statusName);
				var result = this.issueGroups[statusName].issues;
				return result;
			}


			version.getTrackerCount = function (trackerId) {
				console.log('getTrackerCount requested for ' + project.id + ' / ' + this.name  + ' / ' +  trackerId);
				var result = this.issueTrackers[trackerId].count;
				console.log('- Result: ' + result);
				return result;
			}
			version.getTrackerIssues = function (trackerId) {
				console.log('getTrackerCount requested for ' + project.id + ' / ' + this.name  + ' / ' +  trackerId);
				var result = this.issueTrackers[trackerId].issues;
				return result;
			}


			version.getStatusCount = function (statusId) {
				console.log('getStatusCount requested for ' + project.id + ' / ' + this.name  + ' / ' +  statusId);
				var result = this.issueStatuses[statusId].count;
				console.log('- Result: ' + result);
				return result;
			}
			version.getStatusIssues = function (statusId) {
				console.log('getStatusIssues requested for ' + project.id + ' / ' + this.name  + ' / ' +  statusId);
				var result = this.issueStatuses[statusId].issues;
				return result;
			}


			version.getCountByCustomStatusAndTracker = function(statusName, trackerId) {
				var result = 0;
				var issuesSet = this.issueGroups[statusName].issues;

				for (var i=0; i<issuesSet.length; i++) {
					if( issuesSet[i].tracker.id == trackerId ) result++;
				}
				return result;
			}
			version.getIssuesByCustomStatusAndTracker = function(statusName, trackerId) {
				var result = [];
				var issuesSet = this.issueGroups[statusName].issues;

				for (var i=0; i<issuesSet.length; i++) {
					if( issuesSet[i].tracker.id == trackerId ) result.push(issuesSet[i]);
				}
				return result;
			}

			// Reset
			// ---------------------------------------------------------------------------
			version.reset = function () {
				console.log('- Reseting ' + project.id + ' / ' + this.id);

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

				// Predefine standard statuses
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

			}

		version.reset();

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