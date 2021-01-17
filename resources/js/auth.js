console.log('auth.js');
var auth = (function(parent, utils) {
    const self = (parent = parent || {});

    /* Private properties & methods */
    
    const init = function() {
        console.log('auth init...');
        setUser();
    };    

    const setUser = function() {
        self.user = {
            id: 1,
            username: 'yanl'
        };
    };
    /* Event handlers */

    /* Public properties & methods */
    self.isLoggedIn = function() {
        
    };

    init();

    return self;
})(auth || {}, utils);
