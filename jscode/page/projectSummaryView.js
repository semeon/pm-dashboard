function ProjectSummaryView ( prj, eventHandler ) {

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

            var btnGroupNode = $('<div class="btn-group pull-right"></div>');
            projectSummaryNode.append(btnGroupNode);

            var refreshBtnNode = $('<button class="btn" type="button"><i class="icon-refresh"></i></button>');
            btnGroupNode.append(refreshBtnNode);


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

        var row = versionRows[version.id];
        if( row == undefined ) {
            row = $('<tr></tr>');
            versionRows[version.id] = row;
            projectSummaryBodyNode.append(row);
        }

        var html = '';
        html = html + '<td>' + version.name + '</td>';
        html = html + '<td>' + version.due_date + '</td>';

        var columns = project.customStatuses;
        for (var c = 0; c<columns.length; c++) {
            var value = version.issueGroups[columns[c].title].count;
            console.log('  Value for ' + project.id + ' / ' + version.name + ' / ' + columns[c].title + ': ' + value);
            html = html + '<td>' + value + '</td>';
        }
        row.fadeOut();
        row.empty();
        row.append(html);
        row.fadeIn();

    }

    this.clear = function () {
        projectSummaryNode.empty();
    }



}

