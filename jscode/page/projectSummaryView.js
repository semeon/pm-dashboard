function ProjectSummaryView ( prj, eventHandler, rs ) {

    var self = this;
    var project = prj;

    var projectSummaryRootSelector = '#summaryDiv';
    var rootNode = $(projectSummaryRootSelector);

    var projectSummaryNode;
    var projectSummaryBodyNode;
    var projectSummaryTableId = 'summary_table_' + project.id;


    var versionRows = {};

    this.create = function () {
        console.log('Creating project summary header ' + project.id);

        projectSummaryNode = $('<div id="summary_' + project.id + '" class="hide"></div>');
        rootNode.append(projectSummaryNode);

        createProjectTableHeader();
        createProjectControlsNode();
        createProjectStandardTableNode();

        projectSummaryNode.fadeIn();

        // Header --------------------------------------
        function createProjectTableHeader() {
            var headerHtml = '<h3 id="header_' + project.id + '" class="pull-left">' + project.title + '</h3>';
            projectSummaryNode.append(headerHtml);
        }

        // Controls ------------------------------------
        function createProjectControlsNode() {

            var btnToolBar = $('<div class="btn-toolbar  pull-right"></div>');
            projectSummaryNode.append(btnToolBar);

            var customQueryBtnGroupNode = $('<div class="btn-group"></div>');
            btnToolBar.append(customQueryBtnGroupNode);

            if(prj.customQueries) {

                var ddBtnNode = $('<button class="btn btn-small dropdown-toggle" data-toggle="dropdown" href="#">Custom Queries <span class="caret"></span></button>');
                customQueryBtnGroupNode.append(ddBtnNode);

                var customQueriesNode = $('<ul class="dropdown-menu"></ul>');
                customQueryBtnGroupNode.append(customQueriesNode);

                for (var cq=0; cq<prj.customQueries.length; cq++) {
                    var query = prj.customQueries[cq];
                    var href =  rs.redmineUrl + 
                                rs.projectDataUrl + 
                                project.id + '/' +
                                rs.issuesRequestUrl + '?query_id=' + query.id;
                    var ddItemNode = '<li><a href="' + href + '" target="_blank">' + query.title + '</a></li>';
                    customQueriesNode.append(ddItemNode);
                }

            }


            var otherBtnGroupNode = $('<div class="btn-group"></div>');
            btnToolBar.append(otherBtnGroupNode);

            var refreshBtnNode = $('<button class="btn btn-small" type="button"><i class="icon-refresh"></i></button>');
            otherBtnGroupNode.append(refreshBtnNode);


            refreshBtnNode.bind(  'click', 
                                  function() {
                                    eventHandler.onProjectSummaryRefreshBtnClick(project);
                                  }
                               );
        }

        // Standard stat table --------------------------
        function createProjectStandardTableNode() {

            var tableNodeHtml = '';
            tableNodeHtml = tableNodeHtml + '<table id="' + projectSummaryTableId + 
                                            '" class="table table-bordered table-condensed table-hover">';
            // tableNodeHtml = tableNodeHtml +   '<caption>Number of issues in corresponding versions</caption>';
            tableNodeHtml = tableNodeHtml +   '<thead><tr>';
            tableNodeHtml = tableNodeHtml +     '<th width="120">Version</th>';
            tableNodeHtml = tableNodeHtml +     '<th width="100">Due Date</th>';

            var columns = project.customStatuses;

            // Columns
            for (var c = 0; c<columns.length; c++) {
                tableNodeHtml = tableNodeHtml +   '<th>' + columns[c].title + '</th>';
            }

            tableNodeHtml = tableNodeHtml +     '<th style="width: 60px;">Total</th>';
            tableNodeHtml = tableNodeHtml +   '</tr></thead>';
            tableNodeHtml = tableNodeHtml + '</table>';
            var tableNode = $(tableNodeHtml);
            projectSummaryNode.append(tableNode);

            projectSummaryBodyNode = $('<tbody></tbody>');
            tableNode.append(projectSummaryBodyNode);

            rootNode.append('<br/>');
            rootNode.append('<br/>');
        }

    }

    this.updateVersion = function (version) {
        console.log('Updating table row for ' + version.name);

        // Create row
        // ---------------------------------------------------------------------------

            var dueDate = Date.parseExact(version.due_date, 'yyyy-MM-dd');
            var rowStyle = '';
            if ( Date.parse('today').add(7).days().isAfter(dueDate)) {
                rowStyle = 'warning';
            } else if( Date.parse('today').add(3).days().isAfter(dueDate)) {
                rowStyle = 'error';
            }

            var row = versionRows[version.id];
            if( row == undefined ) {
                row = $('<tr class="hide ' + rowStyle + '"></tr>');
                versionRows[version.id] = row;
                projectSummaryBodyNode.append(row);
            }
            row.fadeOut().empty();
            var html = '';

            var colNumber;
            var sortableCols = [];
            var nonSortableCols = [];

        // first cell - version title with modal popup
        // ---------------------------------------------------------------------------
            html = html + '<td class="align-right">' + version.name + '</td>';
            colNumber = 0;
            sortableCols.push(colNumber);


        // second cell - version due date
        // ---------------------------------------------------------------------------
            html = html + '<td>' + version.due_date + '</td>';
            colNumber++;
            sortableCols.push(colNumber);


        // data columns
        // ---------------------------------------------------------------------------
            var columns = project.customStatuses;
            for (var c = 0; c<columns.length; c++) {

                var group = version.issueGroups[columns[c].title];
                var value = group.count;
                console.log('  Value for ' + project.id + ' / ' + version.name + ' / ' + columns[c].title + ': ' + value);

                var valueHtml = '' + value;

                if (value > 0) {

                    // value with modal
                    // ---------------------------------------------------------------------------
                    var modalId = 'modal_' + version.id + '_' + c;
                    valueHtml = '<a href="#' + modalId + 
                                '" role="button" type="link" data-toggle="modal"  title="Click to see the issues in a popup">' + 
                                value + '</a>';

                    var title = 'Issues of ' + project.title + ' / ' + version.name + ' / ' + columns[c].title;
                    var dataTableId = 'datatable_' + modalId;

                    // CREATION OF THE MODAL
                    if ( $('#' + modalId) ) $('#' + modalId).remove();
                    projectSummaryNode.append(addModal(group.issues, modalId, title, dataTableId));

                    $('#' + dataTableId).dataTable({
                                                    'bPaginate': false,
                                                    'bDestroy': true
                                                    });        
                }
                html = html + '<td>' + valueHtml + '</td>';

                colNumber++;
                nonSortableCols.push(colNumber);
            }

        // last cell - total issues number
        // ---------------------------------------------------------------------------
            if (version.issues.length > 0) {
                var versionIssuesModalId = 'modal_' + version.id + '_allissues';
                var versionIssuesDataTableId = 'datatable_' + versionIssuesModalId;
                var versionIssuesTitle = 'Issues of ' + project.title + ' / ' + version.name;
                var cellContent = '<a href="#' + versionIssuesModalId + 
                                '" role="button" type="link" data-toggle="modal"  title="Click to see the issues in a popup">' + 
                                 version.issues.length + '</a>';

                if ( $('#' + versionIssuesModalId) ) $('#' + versionIssuesModalId).remove();
                projectSummaryNode.append(addModal(version.issues, versionIssuesModalId, versionIssuesTitle, versionIssuesDataTableId));

                $('#' + versionIssuesDataTableId).dataTable({
                                                'bPaginate': false,
                                                'bDestroy': true
                                                });

            } else {
                cellContent = version.issues.length;
            }
            html = html + '<td>' + cellContent + '</td>';
            colNumber++;
            nonSortableCols.push(colNumber); 


        // Table actions
        // ---------------------------------------------------------------------------
            row.append(html).fadeIn();

            // Apply sorting to the summary table
            $('#' + projectSummaryTableId).dataTable({
                                            'bPaginate': false,
                                            'bFilter': false,
                                            'aoColumnDefs': [
                                                            { "bSortable": false, "aTargets": nonSortableCols }
                                                            ],
                                            'aaSorting': [[1,'asc']],
                                            'bDestroy': true
                                            });

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

