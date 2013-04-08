function AppView(appEventHandler){

	var self = this;

	this.initialLoadAlert    = new AppAlert('sysMessages', 'initialLoadAlert');
	this.requestStatusAlert  = new AppAlert('statusMessages', 'customRequestAlert');
	this.requestsProgressBar = new ProgressBar('statusMessages', 'requestsProgressBar');


// ===========================================================================================
// PUBLIC
// ===========================================================================================

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
			type: type
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
		if (permanotice.pnotify_remove) permanotice.pnotify_remove();
	}

// ===========================================================================================
// PRIVATE
// ===========================================================================================

	function createProjectTableHeader(projectId, projectTitle) {
		var root = $('#summaryDiv');
		var headerHtml = '';
		headerHtml = headerHtml + '<h4 id="' + projectId + '" class="pull-left">Summary for ' + projectTitle + '</h4>';
		var headerNode = $(headerHtml);
		root.append(headerNode);
	}

	function createProjectControlsNode(projectId) {
		var root = $('#summaryDiv');
		var btnGroupNode = $('<div class="btn-group pull-right"></div>');
		root.append(btnGroupNode);

		var refreshBtnNode = $('<button class="btn btn-small" type="button"><i class="icon-refresh"></i></button>');
		btnGroupNode.append(refreshBtnNode);

		refreshBtnNode.bind(  'click', 
		                      function() {
		                        appEventHandler.onProjectSummaryRefreshBtnClick(projectId);
		                      }
		                   );
	}


	function createProjectTableNode(projectId, queryTitles) {
		// alert('111 ' + version);
		var root = $('#summaryDiv');
		var queriesNumber = queryTitles.length;

		var tableNodeHtml = '';
		tableNodeHtml = tableNodeHtml + '<table id="summary_' + projectId + 
		                                '" class="table table-bordered table-condensed table-hover">';
		// tableNodeHtml = tableNodeHtml +   '<caption>Number of issues in corresponding versions</caption>';
		tableNodeHtml = tableNodeHtml +   '<thead><tr>';
		tableNodeHtml = tableNodeHtml +     '<th width="80">Version</th>';
		for (var q = 0; q<queriesNumber; q++) {
		  tableNodeHtml = tableNodeHtml +   '<th>' + queryTitles[q] + '</th>';
		}
		tableNodeHtml = tableNodeHtml +   '</tr></thead>';
		tableNodeHtml = tableNodeHtml +   '<tbody></tbody>';
		tableNodeHtml = tableNodeHtml + '</table>';

		var tableNode = $(tableNodeHtml);
		root.append(tableNode);
		root.append('<br/>');
	}






}