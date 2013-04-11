function ProjectSummaryView ( pageView ) {

    var self = this;
    var projectSummaryRootSelector = '#summaryDiv';


    this.clear = function () {
        projectSummaryNode.empty();
    }

    this.createBlank = function (project) {

        var rootNode = $(projectSummaryRootSelector);
        var projectSummaryNode = $('<div id="summary_' + project.id + '" class="hide"></div>');
        rootNode.append(projectSummaryNode);

        createProjectTableHeader(rootNode, project.id, project.title);
        createProjectControlsNode(rootNode, project);
        createProjectStandardTableNode(rootNode, project);

        projectSummaryNode.fadeIn();

        // Header --------------------------------------
        function createProjectTableHeader(rootNode, projectId, projectTitle) {
            var headerHtml = '<h4 id="header_' + projectId + '" class="pull-left">' + projectTitle + '</h4>';
            rootNode.append(headerHtml);
        }

        // Controls ------------------------------------
        function createProjectControlsNode(rootNode, project) {

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
        function createProjectStandardTableNode(rootNode, project) {

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

