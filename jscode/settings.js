function Settings() {

  this.userSettings = {
    queryURL: 'http://dintrsrv01.domain.corp/issues',
    userKey: '2da4605ebea54748909b946d3c9d2bd5c04c4837',
    projects: [
      { id: 'isori',
        title: 'FPK Loyalty',
        queryTitles: ['In Development', 'Ready for Deploy', 'Ready for QA', 'Total'],
        versions: [
          { version: '9.0', 
            queries: [           '464',              '462',          '463',   '461']
          },
          { version: '9.1', 
            queries: [           '519',              '520',          '521',   '502']
          },
          { version: '10.0', 
            queries: [           '515',              '516',          '517',   '505']
          }
        ]
      }

      ,
      { id: 'fpkloyalfeedback',
        title: 'FPK Loyalty External',
        queryTitles: ['Total' ],
        versions: [
          { version: '9.0', 
            queries: ['366']
          },
          { version: '9.1', 
            queries: ['497']
          },
          { version: '10.0', 
            queries: ['377']
          }
        ]
      }

      ,
      { id: 'rsalfr',
        title: 'RS Alfresco',
        queryTitles: ['Total' ],
        versions: [
          { version: '2.0', 
            queries: ['435']
          },
          { version: '3.0', 
            queries: ['434']
          }
        ]
      }



    ]
  }

  this.appSettings = {

    appStatus: 'testing'
  }


  this.redmineSettings = {
    userKey:            '2da4605ebea54748909b946d3c9d2bd5c04c4837',
    redmineUrl:         'http://dintrsrv01.domain.corp/',

    // parametered urls
    projectsRequestUrl: 'projects',
    issuesRequestUrl:   'issues',
    queriesRequestUrl:  'queries',

    // project-based urls
    projectDataUrl:     'projects/',
    versionsRequestUrl:  'versions',

    responseLimit: 50,

    jsonRequestModifier: '.json'

  }


}
