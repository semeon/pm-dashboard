function ProjectSummaryView ( prj ) {

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
            rootNode.append(headerHtml);
        }

        // Controls ------------------------------------
        function createProjectControlsNode() {

            var btnGroupNode = $('<div class="btn-group pull-right"></div>');
            rootNode.append(btnGroupNode);

            var refreshBtnNode = $('<button class="btn btn" type="button"><i class="icon-refresh"></i></button>');
            btnGroupNode.append(refreshBtnNode);

            refreshBtnNode.bind(  'click', 
                                  function() {
                                    pageView.eventHandler.onProjectSummaryRefreshBtnClick(project);
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
            rootNode.append(tableNode);

            projectSummaryBodyNode = $('<tbody></tbody>');
            tableNode.append(projectSummaryBodyNode);

            rootNode.append('<br/>');
        }
        projectSummaryNode.fadeIn();
    }

    this.updateVersion = function (version) {
        console.log('Updating project summary for ' + project.id + ' / ' + version.name);

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
            console.log('  Value  for ' + project.id + ' / ' + version.name + ': ' + value);
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

    this.createBlank = function (project) {

        console.log('Creating project summary blank for ' + project.id);
        var rootNode = $(projectSummaryRootSelector);
        var projectSummaryNode = $('<div id="summary_' + project.id + '" class="hide"></div>');
        rootNode.append(projectSummaryNode);

        createProjectTableHeader(rootNode, project.id, project.title);
        createProjectControlsNode(rootNode, project);
        createProjectStandardTableNode(rootNode, project);

        projectSummaryNode.fadeIn();






        // Standard stat table --------------------------
        function createProjectStandardTableNode2(rootNode, project) {

            var tableNodeHtml = '';
            tableNodeHtml = tableNodeHtml + '<table id="summary_' + project.id + 
                                            '" class="table table-bordered table-condensed table-hover">';
            // tableNodeHtml = tableNodeHtml +   '<caption>Number of issues in corresponding versions</caption>';
            tableNodeHtml = tableNodeHtml +   '<thead><tr>';
            tableNodeHtml = tableNodeHtml +     '<th width="100">Version</th>';
            tableNodeHtml = tableNodeHtml +     '<th width="100">Due Date</th>';

            var columns = pageView.userSettings.getProjectSettingsById(project.id).customStatuses;

            // Columns
            for (var c = 0; c<columns.length; c++) {
                tableNodeHtml = tableNodeHtml +   '<th>' + columns[c].title + '</th>';
            }

            // tableNodeHtml = tableNodeHtml +     '<th></th>';

            tableNodeHtml = tableNodeHtml +   '</tr></thead>';
            tableNodeHtml = tableNodeHtml +   '<tbody>';

            // Rows
            var rows = project.versions;
            for (verName in project.versions) {
                var version = project.versions[verName];
                tableNodeHtml = tableNodeHtml + '<tr>';
                tableNodeHtml = tableNodeHtml +     '<td>' + version.name + '</td>';
                tableNodeHtml = tableNodeHtml +     '<td>' + version.due_date + '</td>';

                for (var c = 0; c<columns.length; c++) {
                    var nodeId = createNodeId(project.id, version.id, columns[c].title);
                    tableNodeHtml = tableNodeHtml + '<td id="' + nodeId + '"> - </td>';
                }
                // tableNodeHtml = tableNodeHtml +     '<td><button class="btn btn-mini" type="button"><i class="icon-refresh"></i></button></td>';

                tableNodeHtml = tableNodeHtml + '</tr>';

              // tableNodeHtml = tableNodeHtml +   '<tr>' + columns[c].title + '</tr>';
            }


            tableNodeHtml = tableNodeHtml +   '</tbody>';
            tableNodeHtml = tableNodeHtml + '</table>';

            var tableNode = $(tableNodeHtml);
            rootNode.append(tableNode);
            rootNode.append('<br/>');
        }

    }

    this.update = function (project) {

        for (verId in project.versions) {
            var version = project.versions[verId];

            for (groupName in version.issueGroups) {
                var group = version.issueGroups[groupName];
                // var selector = '#' + createNodeId(project.id, version.id, group.title);

                // var node = $('<span class="hide">' + group.count + '</span>');
                // $(selector).empty();
                // $(selector).append(node);
                // node.fadeIn();

                self.updateCell(project.id, version.id, group.title, group.count);
            }
        }
    }

    this.updateCell = function(projectId, versionId, groupName, newValue) {
        var selector = '#' + createNodeId(projectId, versionId, groupName);

        console.log('Updating cell ' + selector + ' with new value: ' +  newValue);

        var node = $('<span class="hide">' + newValue + '</span>');
        $(selector).empty();
        $(selector).append(node);
        node.delay(500).fadeIn();

    }

// ===========================================================================================
// PRIVATE
// ===========================================================================================

    function createNodeId (prId, verId, grName) {
        var nodeId = 'count_' + prId + '_' + verId + '_' + grName;
        return nodeId;

    }



}

