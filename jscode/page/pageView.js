function AppView(eventHandler, userSettings, appSettings, redmineSettings){

	var self = this;

	this.eventHandler = eventHandler;
	this.userSettings = userSettings;

	this.initialLoadAlert    = new AppAlert('sysMessages', 'initialLoadAlert');
	this.requestStatusAlert  = new AppAlert('statusMessages', 'customRequestAlert');
	this.requestsProgressBar = new ProgressBar('statusMessages', 'requestsProgressBar');

	this.projectSummaryView = new ProjectSummaryView(self);



// ===========================================================================================
// PUBLIC
// ===========================================================================================

	this.switchFromGreatingsToPleaseWait = function() {
		$('#greatingsMessage').addClass('hide');
		$('#pleaseWaitMessage').removeClass('hide');
		$('#pleaseWaitMessage').removeClass('hide');
	}

	this.displayItem = function(selector) {
		$(selector).fadeIn();
	}

	this.hideItem = function(selector) {
		$(selector).addClass('hide');
	}

	this.listProjectsOnTheGreatingScreen = function() {
		var projects = userSettings.projects;
		var root =  $('#userProjectList');

		var href = redmineSettings.redmineUrl + redmineSettings.projectsRequestUrl;

		for (var i=0; i<projects.length; i++) {
			href = href + '\\' + projects[i].id;
			root.append('<li><a href="' + href + '" target="_blank">' + projects[i].title + '</li>');
		}
	}








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


	// System messages
	// -------------------------------------------------------------------------------------------

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

// ===========================================================================================
// PRIVATE
// ===========================================================================================








}