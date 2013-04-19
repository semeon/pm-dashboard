function ProjectSummaryView ( prj, eventHandler, rs ) {

    var self = this;
    var project = prj;

    var projectSummaryRootSelector = '#summaryDiv';
    var rootNode = $(projectSummaryRootSelector);

    var projectSummaryNode;
    var hiddenNodeForModals;
    var versionSummaryNodes = {};

	var versionControlsIdPrefix = 'ver_summary_controls_';
	var versionTableIdPrefix = 'ver_summary_table_';
	var versionBodyIdPrefix = 'ver_summary_table_body_';
	var versionFooterIdPrefix = 'ver_summary_table_footer_';


    var versionRows = {};

    this.create = function () {
		console.log('Creating project summary ' + project.id);

		projectSummaryNode = $('<div id="proj_summary_' + project.id + '" class="hide well well-small"></div>');
		rootNode.append(projectSummaryNode);
		projectSummaryNode.append(createProjectHeader());
		projectSummaryNode.fadeIn();

		hiddenNodeForModals = $('<div class=""></div>');
		projectSummaryNode.append(hiddenNodeForModals);

		// Project Header --------------------------------------
		function createProjectHeader() {
			var headerHtml = '<div><h4 id="proj_header_' + 
								project.id + '">Project: ' + 
								project.title + '</h4></div>';
			var headerNode = $(headerHtml);
			return headerNode;
		}

    }

    this.addVersion = function (version) {

		console.log('- Creating version summary blank' + version.name);

		var versionSummaryNode = $('<div id="ver_summary_' + version.id + '" class="hide clearfix"></div>');
		versionSummaryNodes[version.id] = versionSummaryNode;
		projectSummaryNode.append(versionSummaryNode);

		versionSummaryNode.append( createVersionHeader(version) );
		versionSummaryNode.append( createVersionControls(version) );

		versionSummaryNode.append( createVersionTable(version) );


		versionSummaryNode.fadeIn();

		// Version Header --------------------------------------
		function createVersionHeader(version) {
		    var headerNode = $('<h5 id="ver_header_' + 
		                        version.id + '" class="pull-left">Version: ' + 
		                        version.name + ' / Due to: ' + 
		                        version.due_date + '</h5>');
		    return headerNode;
		}

		// Version Controls ------------------------------------
		function createVersionControls(version) {

		    var btnToolBar = $('<div id="' + versionControlsIdPrefix + version.id + '" class="btn-toolbar  pull-right"></div>');

		    var otherBtnGroupNode = $('<div class="btn-group"></div>');
		    btnToolBar.append(otherBtnGroupNode);

			var hideButton = $('<button class="btn btn-mini" type="button">Hide</button>');
			otherBtnGroupNode.append(hideButton);
			hideButton.bind(  'click', 
									function() {
										$('#' + versionTableIdPrefix + version.id).toggle();
										hideButton.toggleClass('active');										
									}
								);


			var detailsButton = $('<button class="btn btn-mini" type="button">Details</button>');
			otherBtnGroupNode.append(detailsButton);
			detailsButton.bind(  'click', 
									function() {
										$('#' + versionBodyIdPrefix + version.id).toggle();
										detailsButton.toggleClass('active');										
									}
								);

			var refreshBtnNode = $('<button class="btn btn-mini" type="button">Refresh</button>');
			otherBtnGroupNode.append(refreshBtnNode);
			refreshBtnNode.bind(  'click', 
									function() {
									eventHandler.onVersionSummaryRefreshBtnClick(project, version);
									}
								);


		    return btnToolBar;
		}

		// Standard version table --------------------------
		function createVersionTable(version) {

		    var tableNodeHtml = '';
		    tableNodeHtml = tableNodeHtml + '<table id="' + versionTableIdPrefix + version.id + 
		                                    '" class="table table-bordered table-condensed table-hover">';
		    tableNodeHtml = tableNodeHtml +   '<thead><tr class="info">';
		    tableNodeHtml = tableNodeHtml +     '<th width="100" style="text-align: left!important;">Tracker</th>';

		    // Columns
			var columns = project.customStatuses;
		    for (var c = 0; c<columns.length; c++) {
		        tableNodeHtml = tableNodeHtml +   '<th>' + columns[c].title + '</th>';
		    }

		    tableNodeHtml = tableNodeHtml +     '<th width="80">Total</th>';
		    tableNodeHtml = tableNodeHtml +   '</tr></thead>';
		    tableNodeHtml = tableNodeHtml + '</table>';

		    var tableNode = $(tableNodeHtml);
		    
			var bodyId = versionBodyIdPrefix + version.id;
			projectSummaryBodyNode = $('<tbody id="' + bodyId + '" class="hide"></tbody>');
			tableNode.append(projectSummaryBodyNode);

			var footerId = versionFooterIdPrefix + version.id;
			projectSummaryFooterNode = $('<tfoot id="' + footerId + '" class="hidden"></tfoot>');
			tableNode.append(projectSummaryFooterNode);

 
		    return tableNode;
		}


    }


    this.updateVersion = function (version) {
		console.log('Updating version summary ' + version.name);

        var bodyId = versionBodyIdPrefix + version.id;
        var bodyNode = $('#' + bodyId)

        bodyNode.empty();

		var rowCounter = 0;

		// Each row is a tracker
        for (var it=0; it<project.issueTrackers.length; it++) {
			rowCounter++;
        	var trackerId = project.issueTrackers[it];
			var trackerName = rs.issueTrackersMap[String(trackerId)].name;

			console.log('- Creating row for ' + trackerName + ' (' + trackerId + ')');

			// Create row
			// ---------------------------------------------------------------------------
				var rowNode = $('<tr class="hide"></tr>');
				bodyNode.append(rowNode);

				// Create "tracker" column
				// ---------------------------------------------------------------------------
					console.log('-- Creating cell for traker name: ' + trackerName);
					var node = $('<td style="text-align: left!important;">' + trackerName + '</td>');
					rowNode.append(node)

				// Create data columns
				// ---------------------------------------------------------------------------
					var columns = project.customStatuses;
					var columnCounter = 0;
					for (cs in columns) {
						columnCounter++;

						var groupName = columns[cs].title;
						var issues = version.getIssuesByCustomStatusAndTracker(groupName, trackerId);

						console.log('-- Creating cell for custom status: ' + groupName);
						rowNode.append( createDataCell(issues, rowCounter, columnCounter, trackerName + ' / ' + groupName) );
					}


				// Create total column
				// ---------------------------------------------------------------------------
					console.log('-- Creating cell for total');
					var issues = version.getTrackerIssues(trackerId);
					rowNode.append( createDataCell(issues, rowCounter, 'total', trackerName) );

			rowNode.fadeIn();

		} // End of Tracker Row --------------------------------------------



		//  Create footer row
		// ------------------------------------------------------------------------------------
			var footerNode = $('#' + versionFooterIdPrefix + version.id);
			footerNode.empty();

			var sumRowNode = $('<tr class="hide info"></tr>');
			footerNode.append(sumRowNode);

			// Create "Summary" column
			// ---------------------------------------------------------------------------
				console.log('-- Creating cell for version summary caption');
				var node = $('<td style="text-align: left!important;">All Trackers</td>');
				sumRowNode.append(node)


			// Create data columns
			// ---------------------------------------------------------------------------
				var columns = project.customStatuses;
				var columnCounter = 0;
				for (cs in columns) {
					columnCounter++;

					var groupName = columns[cs].title;
					var issues = version.getCustomStatusIssues(groupName);

					console.log('-- Creating cell for custom status: ' + groupName);
					sumRowNode.append( createDataCell(issues, rowCounter, columnCounter, trackerName + ' / ' + groupName) );
				}

			// Create Total/Total cell
			// ---------------------------------------------------------------------------
				columnCounter++;

				var issues = version.issues;

				console.log('-- Creating cell for custom status: ' + groupName);
				sumRowNode.append( createDataCell(issues, rowCounter, columnCounter, 'All') );



		sumRowNode.fadeIn();


		function createDataCell (issues, rowCounter, columnCounter, columnName) {
			var value = issues.length;
			var valueHtml = value;

			if (value > 0) {
				// value with modal
				// ---------------------------------------------------------------------------
					var modalId = 'modal_' + version.id + '_' + rowCounter + '_' + columnCounter;
					valueHtml = '<a href="#' + modalId + 
								'" role="button" type="link" data-toggle="modal"  title="Click to see the issues in a popup">' + 
								value + '</a>';

					var dataTableId = 'datatable_' + modalId;
                    var title = project.title + ' / ' + version.name + ' / ' + columnName;

					if ( $('#' + modalId) ) $('#' + modalId).remove();
					hiddenNodeForModals.append(addModal(issues, modalId, title, dataTableId));

					$('#' + dataTableId).dataTable({
											'bPaginate': false,
											'bDestroy': true
											}); 
			}

			var tdNode = $('<td></td>');
			tdNode.append(valueHtml);

			return tdNode;

        } 


        return;


        // // Table actions
        // // ---------------------------------------------------------------------------
        //     row.append(html).fadeIn();

        //     // Apply sorting to the summary table
        //     $('#' + projectSummaryTableId).dataTable({
        //                                     'bPaginate': false,
        //                                     'bFilter': false,
        //                                     'aoColumnDefs': [
        //                                                     { "bSortable": false, "aTargets": nonSortableCols }
        //                                                     ],
        //                                     'aaSorting': [[1,'asc']],
        //                                     'bDestroy': true
                                            // });

    }

    // Creating a modal with list of issues
    function addModal(issues, id, title, dataTableId) {
        console.log('Creating modal ' + title);

        var modalCode = '';
        modalCode = modalCode + '<div id="' + id + '" class="modal hide fade" tabindex="-1" ' +
                                ' role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';

        modalCode = modalCode +     '<div class="modal-header">';
        modalCode = modalCode +         '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
        modalCode = modalCode +      '<h3 id="myModalLabel">' + title + '</h3>';
        modalCode = modalCode +     '</div>';
        modalCode = modalCode +     '<div class="modal-body">';

        modalCode = modalCode +         '<table id="' + dataTableId + '" class="table table-bordered table-striped table-condensed table-hover">';
        modalCode = modalCode +             '<thead>';
        modalCode = modalCode +                 '<th>#</th>';
        modalCode = modalCode +                 '<th>Status</th>';
        modalCode = modalCode +                 '<th>Tracker</th>';
        modalCode = modalCode +                 '<th>Subject</th>';
        modalCode = modalCode +                 '<th>Assignee</th>';
        modalCode = modalCode +             '</thead>';
        modalCode = modalCode +             '<tbody>';

        for (var i=0; i<issues.length; i++) {
            var issue = issues[i];
            // console.log('  Adding issue #' + issue.id + ' to data table');
            modalCode = modalCode +         '<tr>';
            modalCode = modalCode +             '<td>';
            modalCode = modalCode +                 '<a href="' + rs.redmineUrl + 
                                                                rs.issuesRequestUrl + '/' + 
                                                                issue.id + '" target="_blank">';
            modalCode = modalCode +                     '#' + issue.id;
            modalCode = modalCode +                 '</a>';
            modalCode = modalCode +             '</td>';
            modalCode = modalCode +             '<td>' + issue.status.name + '</td>';
            modalCode = modalCode +             '<td>' + issue.tracker.name + '</td>';
            modalCode = modalCode +             '<td class="align-left">' + issue.subject + '</td>';

            var assignee = 'Nobody';
            if (issue.assigned_to) assignee = issue.assigned_to.name;

            modalCode = modalCode +             '<td>' + assignee + '</td>';
            modalCode = modalCode +         '</tr>';
        }

        modalCode = modalCode +             '<tbody>';
        modalCode = modalCode +         '</table>';


        modalCode = modalCode +     '</div>';
        modalCode = modalCode +     '<div class="modal-footer">';
        modalCode = modalCode +         '<button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>';
        modalCode = modalCode +     '</div>';
        modalCode = modalCode + '</div>';

        return $(modalCode);

    }


    this.clear = function () {
        projectSummaryNode.empty();
    }

}

