function AppView(eventHandler, userSettings, appSettings, redmineSettings){

	var self = this;

	this.eventHandler = eventHandler;
	this.userSettings = userSettings;

	this.initialLoadAlert    = new AppAlert('sysMessages', 'initialLoadAlert');
	this.requestStatusAlert  = new AppAlert('statusMessages', 'customRequestAlert');
	this.requestsProgressBar = new ProgressBar('statusMessages', 'requestsProgressBar');

	this.batchLoadBars = {};
	this.projectSummaries = {};


	this.projectSummaryView = new ProjectSummaryView(self);

// -------------------------------------------------------------------------------------------
// Summaries
// 

	this.createSummary = function(project, version) {

		var id = project.id;
		var summary = self.projectSummaries[id];

		if (summary == undefined) {
			console.log('Creating summary table for ' + project.id);

			summary = new ProjectSummaryView(project);
			self.projectSummaries[id] = summary;

			summary.createHeader();
		}
	}



	this.updateSummary = function(project, version) {
		self.projectSummaries[project.id].updateVersion(version);
	}


// -------------------------------------------------------------------------------------------
// Load statuses
// 

	this.showBatchLoadProgressBar = function (project, version) {
		console.log('Creating progress bar position for ' + project.id + ' / ' + version.name);

		var id = project.id + '_' + version.id;
		var pb = self.batchLoadBars[id];
		if (pb == undefined) {
			var rootId = 'statusMessages';
			pb = new ProgressBar(rootId, project.title + ' / ' + version.name);
			self.batchLoadBars[id] = pb;
		}
		pb.show('striped');
	}

	this.updateBatchLoadProgresBar = function (project, version, current, total) {
		var pb = self.batchLoadBars[project.id + '_' + version.id];
		console.log('Updating progress bar position for ' + project.id + ' / ' + version.name);

		pb.update(current, total, 'striped');
		if (current == total) {
			pb.hide();
		}
	}


// -------------------------------------------------------------------------------------------
// Welcome screen
// 

	this.switchFromGreatingsToPleaseWait = function() {
		$('#greatingsMessage').addClass('hide');
		// $('#pleaseWaitMessage').removeClass('hide');
		// $('#pleaseWaitMessage').delay(4000).fadeOut();
	}

	this.displayItem = function(selector) {
		$(selector).fadeIn();
	}

	this.hideItem = function(selector) {
		// $(selector).addClass('hide');
		$(selector).fadeOut();
	}

	this.listProjectsOnTheGreatingScreen = function() {
		var projects = userSettings.projects;
		var root =  $('#userProjectList');

		var href = redmineSettings.redmineUrl + redmineSettings.projectsRequestUrl;

		if (projects.length > 0) {
			for (var i=0; i<projects.length; i++) {
				href = href + '\\' + projects[i].id;
				root.append('<li><a href="' + href + '" target="_blank">' + projects[i].title + '</li>');
			}
			$('#startLoadingBtn').fadeIn();
		} else {
			root.append('<li>Nothing to load!</li>');
			self.showAlert('Epic fail!', 'Get a project first, manager..', 'error');
		}

	}


// -------------------------------------------------------------------------------------------
// Popup messages
// 
	var permanotice;

	this.showAlert = function(title, text, type) {
		$.pnotify({
			title: title,
			text: text,
			type: type,
		    history: false
		});
	}

	this.showPermanotice = function(title, text, type) {
		if (permanotice) {
		    permanotice.pnotify_display();
		} else {
		    permanotice = $.pnotify({
		        title: title,
		        text: text,
		        type: type,
		        nonblock: true,
		        hide: false,
		        closer: false,
		        sticker: false,

		        history: false
		    });
		}
	}

	this.removePermanotice = function(title, text, type) {
		if (permanotice && permanotice.pnotify_remove) permanotice.pnotify_remove();
	}


// --------------------------------------------------------
// OLD CUSTOM SUMMARY - to reuse for custom stats
//
	// Project Summary
	this.createProjectSummary = function(projectId, projectTitle, queryTitles) {
		createProjectControlsNode(projectId);
		createProjectTableHeader(projectId, projectTitle);
		createProjectTableNode(projectId, queryTitles);
	}

	this.createProjectTableRowNode = function(projectId, version) {
		var root = $('#summary_' + projectId);
		var trNode = $('<tr id="queryRow_' + projectId + '_' + version + '"><th>' + version + '</th></tr>');
		root.append(trNode);
		return trNode;
	}

	this.appendQueryResultNode = function(root, projectId, version, queryId) {
		var tdNode = $('<td id="queryResult_' + queryId +'"></td>');
		root.append(tdNode);
	}

	this.showQueryResult = function(queryId, queryResult, url) {
		$('#queryResult_' + queryId).empty();

		var node = $('<a href="' + url + '" target="_blank" class="hide">' + queryResult + '</a>');

		$('#queryResult_' + queryId).append(node);
		node.fadeIn(600);
	}



}