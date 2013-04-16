function ProjectSummaryView ( prj, eventHandler, rs ) {

    var self = this;
    var projectSummaryRootSelector = '#summaryDiv';
    var rootNode = $(projectSummaryRootSelector);

    var projectSummaryNode;
    var projectSummaryBodyNode;


    var project = prj;
    var versionRows = {};

    this.createHeader = function () {
        console.log('Creating project summary header ' + project.id);

        projectSummaryNode = $('<div id="summary_' + project.id + '" class="hide"></div>');
        rootNode.append(projectSummaryNode);

        createProjectTableHeader();
        createProjectControlsNode();
        createProjectStandardTableNode();

        // Header --------------------------------------
        function createProjectTableHeader() {
            var headerHtml = '<h4 id="header_' + project.id + '" class="pull-left">' + project.title + '</h4>';
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
            tableNodeHtml = tableNodeHtml + '<table id="summary_' + project.id + 
                                            '" class="table table-bordered table-condensed table-hover">';
            // tableNodeHtml = tableNodeHtml +   '<caption>Number of issues in corresponding versions</caption>';
            tableNodeHtml = tableNodeHtml +   '<thead><tr>';
            tableNodeHtml = tableNodeHtml +     '<th width="100">Version</th>';
            tableNodeHtml = tableNodeHtml +     '<th width="100">Due Date</th>';

            var columns = project.customStatuses;

            // Columns
            for (var c = 0; c<columns.length; c++) {
                tableNodeHtml = tableNodeHtml +   '<th>' + columns[c].title + '</th>';
            }
            // tableNodeHtml = tableNodeHtml +     '<th></th>';

            tableNodeHtml = tableNodeHtml +   '</tr></thead>';
            tableNodeHtml = tableNodeHtml + '</table>';
            var tableNode = $(tableNodeHtml);
            projectSummaryNode.append(tableNode);

            projectSummaryBodyNode = $('<tbody></tbody>');
            tableNode.append(projectSummaryBodyNode);

            rootNode.append('<br/>');
        }
        projectSummaryNode.fadeIn();
    }

    this.updateVersion = function (version) {

        console.log('Updating table row for ' + version.name);

        var row = versionRows[version.id];
        if( row == undefined ) {
            row = $('<tr class="hide"></tr>');
            versionRows[version.id] = row;
            projectSummaryBodyNode.append(row);
        }

        row.fadeOut().empty();

        var cellContent = version.name;
        if (version.href) {
            cellContent = '<a href="' + version.href + 
                           '" target="_blank" title="Click to open issues in a new window">' + 
                           version.name + ' <i class="icon-search"></i></a>';
        } 

        console.log('  cellContent: ' + cellContent);
        var html = '';
        html = html + '<td class="align-right">' + cellContent + '</td>';
        html = html + '<td>' + version.due_date + '</td>';

        var columns = project.customStatuses;
        for (var c = 0; c<columns.length; c++) {
            var group = version.issueGroups[columns[c].title];
            var value = group.count;
            console.log('  Value for ' + project.id + ' / ' + version.name + ' / ' + columns[c].title + ': ' + value);

            var valueHtml = '' + value;

            if (value > 0) {
                var modalId = 'modal_' + version.id + '_' + c;
                valueHtml = '<a href="#' + modalId + 
                            '" role="button" class="link" data-toggle="modal"  title="Click to see the issues in a popup">' + 
                            value + '</a>';

                var title = 'Issues of ' + project.title + ' / ' + version.name + ' / ' + columns[c].title;
                projectSummaryBodyNode.append(addModal(group, modalId, title));
            }


            html = html + '<td>' + valueHtml + '</td>';
        }
        row.append(html).fadeIn();

        function addModal(group, id, title) {
            var modalCode = '';
            modalCode = modalCode + '<div id="' + id + '" class="modal hide fade" tabindex="-1" ' +
                                    ' role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';

            modalCode = modalCode +     '<div class="modal-header">';
            modalCode = modalCode +         '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>';
            modalCode = modalCode +      '<h3 id="myModalLabel">' + title + '</h3>';
            modalCode = modalCode +     '</div>';
            modalCode = modalCode +     '<div class="modal-body">';

            modalCode = modalCode +         '<table class="table table-bordered table-condensed table-hover">';
            modalCode = modalCode +             '<thead>';
            modalCode = modalCode +                 '<th>#</th>';
            modalCode = modalCode +                 '<th>Status</th>';
            modalCode = modalCode +                 '<th>Tracker</th>';
            modalCode = modalCode +                 '<th>Subject</th>';
            modalCode = modalCode +                 '<th>Assigned To</th>';
            modalCode = modalCode +             '</thead>';
            modalCode = modalCode +             '<tbody>';

            for (var i=0; i<group.issues.length; i++) {
                var issue = group.issues[i];
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
                modalCode = modalCode +             '<td>' + issue.assigned_to.name + '</td>';
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
    }


    this.clear = function () {
        projectSummaryNode.empty();
    }

}

