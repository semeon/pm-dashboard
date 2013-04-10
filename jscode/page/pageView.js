function AppView(eventHandler, userSettings, appSettings, redmineSettings){

	var self = this;

	var projectSummaryRootSelector = '#summaryDiv';

	this.initialLoadAlert    = new AppAlert('sysMessages', 'initialLoadAlert');
	this.requestStatusAlert  = new AppAlert('statusMessages', 'customRequestAlert');
	this.requestsProgressBar = new ProgressBar('statusMessages', 'requestsProgressBar');


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



	// -------------------------------------------------------------------------------------------
	// Project summary
	// -------------------------------------------------------------------------------------------
	this.clearProjectSummaryRoot = function () {
		projectSummaryNode.empty();
	}

	this.createProjectSummaryBlank = function (project) {

		var rootNode = $(projectSummaryRootSelector);
		var projectSummaryNode = $('<div id="summary_' + project.id + '"></div>');
		rootNode.append(projectSummaryNode);

		createProjectTableHeader(rootNode, project.id, project.title);
		createProjectControlsNode(rootNode, project.id);
		createProjectStandardTableNode(rootNode, project);

		// Header --------------------------------------
		function createProjectTableHeader(rootNode, projectId, projectTitle) {
			var headerHtml = '<h4 id="header_' + projectId + '" class="pull-left">' + projectTitle + '</h4>';
			rootNode.append(headerHtml);
		}

		// Controls ------------------------------------
		function createProjectControlsNode(rootNode, projectId) {

			var btnGroupNode = $('<div class="btn-group pull-right"></div>');
			rootNode.append(btnGroupNode);

			var refreshBtnNode = $('<button class="btn btn" type="button"><i class="icon-refresh"></i></button>');
			btnGroupNode.append(refreshBtnNode);

			refreshBtnNode.bind(  'click', 
			                      function() {
			                        eventHandler.onProjectSummaryRefreshBtnClick(projectId);
			                      }
			                   );
		}

		// Standard stat table --------------------------
		function createProjectStandardTableNode(rootNode, project) {

			var tableNodeHtml = '';
			tableNodeHtml = tableNodeHtml + '<table id="summary_' + project.id + 
			                                '" class="table table-bordered table-condensed table-hover">';
			// tableNodeHtml = tableNodeHtml +   '<caption>Number of issues in corresponding versions</caption>';
			tableNodeHtml = tableNodeHtml +   '<thead><tr>';
			tableNodeHtml = tableNodeHtml +     '<th width="100">Version</th>';

			var columns = userSettings.getProjectSettingsById(project.id).customStatuses;

			// Columns
			for (var c = 0; c<columns.length; c++) {
			  	tableNodeHtml = tableNodeHtml +   '<th>' + columns[c].title + '</th>';
			}

			tableNodeHtml = tableNodeHtml +   '</tr></thead>';
			tableNodeHtml = tableNodeHtml +   '<tbody>';

			// Rows
			var rows = project.versions;
			for (verName in project.versions) {
				var version = project.versions[verName];
			  	tableNodeHtml = tableNodeHtml +	'<tr>';
			  	tableNodeHtml = tableNodeHtml + 	'<th>' + version.name + '</th>';

				for (var c = 0; c<columns.length; c++) {
					var nodeId = 'count_' + project.id + '_' + version.id + '_' + columns[c].title;
				  	tableNodeHtml = tableNodeHtml +	'<td id="' + nodeId + '"> - </td>';
				}
			  	tableNodeHtml = tableNodeHtml +	'</tr>';

			  // tableNodeHtml = tableNodeHtml +   '<tr>' + columns[c].title + '</tr>';
			}


			tableNodeHtml = tableNodeHtml +   '</tbody>';
			tableNodeHtml = tableNodeHtml + '</table>';

			var tableNode = $(tableNodeHtml);
			rootNode.append(tableNode);
			rootNode.append('<br/>');
		}

	}// -------------------------------------------------------------------------------------------




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

	// function createProjectTableHeader(projectId, projectTitle) {
	// 	var root = $('#summaryDiv');
	// 	var headerHtml = '';
	// 	headerHtml = headerHtml + '<h4 id="' + projectId + '" class="pull-left">Summary for ' + projectTitle + '</h4>';
	// 	var headerNode = $(headerHtml);
	// 	root.append(headerNode);
	// }

	// function createProjectControlsNode(projectId) {
	// 	var root = $('#summaryDiv');
	// 	var btnGroupNode = $('<div class="btn-group pull-right"></div>');
	// 	root.append(btnGroupNode);

	// 	var refreshBtnNode = $('<button class="btn btn-small" type="button"><i class="icon-refresh"></i></button>');
	// 	btnGroupNode.append(refreshBtnNode);

	// 	refreshBtnNode.bind(  'click', 
	// 	                      function() {
	// 	                        appEventHandler.onProjectSummaryRefreshBtnClick(projectId);
	// 	                      }
	// 	                   );
	// }


	// function createProjectTableNode(projectId, queryTitles) {
	// 	// alert('111 ' + version);
	// 	var root = $('#summaryDiv');
	// 	var queriesNumber = queryTitles.length;

	// 	var tableNodeHtml = '';
	// 	tableNodeHtml = tableNodeHtml + '<table id="summary_' + projectId + 
	// 	                                '" class="table table-bordered table-condensed table-hover">';
	// 	// tableNodeHtml = tableNodeHtml +   '<caption>Number of issues in corresponding versions</caption>';
	// 	tableNodeHtml = tableNodeHtml +   '<thead><tr>';
	// 	tableNodeHtml = tableNodeHtml +     '<th width="80">Version</th>';
	// 	for (var q = 0; q<queriesNumber; q++) {
	// 	  tableNodeHtml = tableNodeHtml +   '<th>' + queryTitles[q] + '</th>';
	// 	}
	// 	tableNodeHtml = tableNodeHtml +   '</tr></thead>';
	// 	tableNodeHtml = tableNodeHtml +   '<tbody></tbody>';
	// 	tableNodeHtml = tableNodeHtml + '</table>';

	// 	var tableNode = $(tableNodeHtml);
	// 	root.append(tableNode);
	// 	root.append('<br/>');
	// }






}