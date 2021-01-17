'use strict';
/*
 * todo
 * refactor the getPost, getPostDetails, getComments in a generic function with params ?
 * submit post + validation
 * confirm delete
 * handle failure
 * rework posts/filteredPosts ?
 * security, sanitize inputs & json check for xss
 * local storage if time
 * styling
 * hide comments
 * loading status icons, etc
 * pagination
 * routing 
 */
console.log('main.js');
var main = (function(parent, auth, utils) {
    // private properties
    const self = (parent = parent || {});
    const doc = document;
    const conf = {
        provider: 'https://jsonplaceholder.typicode.com/'
    };
    // dom elements used
    const elems = {
        searchCount: doc.getElementById('search-count'),
        posts: doc.getElementById('posts'),
        newPost: doc.getElementById('new-post-modal')
    };
    const state = {
        sortingAsc: true,
        view: 'full',
    };

    let posts;
    let filteredPosts;
    
    // private methods
    const init = function() {
        console.log('init');
        get();
    };

    const setViewList = function() {
        if (state.view === 'list') return;
        state.view = 'list';
        renderPosts(filteredPosts);
    };

    const setViewFull = function() {
        if (state.view === 'full') return;
        state.view = 'full';
        renderPosts(filteredPosts);
    };

    // todo sanitize inputs
    const get = function() {
        const url = `${conf.provider}posts`;
        try {
            fetch(url)
            .then(response => response.json())
            .then(function(json) {
                filteredPosts = posts = json;
                
                renderPosts(posts);
            });
        } catch (error) {
            console.log('Error loading data, please try again later');
        }
        
    }

    const del = function(id) {
        const url = `${conf.provider}posts/${id}`;
        try {
            fetch(url, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(function(json) {
                console.log('delete resp', json);
                //filteredPosts = posts = json;
                filteredPosts = filteredPosts.filter(function(post) {
                    return post.id != id;
                });
                updatePostCount();
                renderPosts(filteredPosts);
            });
        } catch (error) {
            console.log('Error loading data, please try again later');
        }
    }
    
    const set = function(post) {
        const url = `${conf.provider}posts`;
        console.log(JSON.stringify(post));
        try {
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                  },
                body: JSON.stringify(post)
            })
            .then(response => response.json())
            .then(function(json) {
                posts.push(json);
                filteredPosts.push(json);
                updatePostCount();
                renderPosts(filteredPosts);
                utils.toggleLoading(doc.getElementById('new-post-send'));
                bootstrap.Modal.getInstance(elems.newPost).hide();
            });
        } catch (error) {
            console.log('Error loading data, please try again later');
        }
    };

    const getPostDetails = function() {
        const url = this.getAttribute('href');
        const postID = this.getAttribute('data-id');
        const el = this;
        utils.toggleLoading(this);
        renderPostDetails(postID);
        try {
            fetch(url)
            .then(response => response.json())
            .then(function(json) {
                setTimeout(() => {
                    renderPostDetails(postID, json);
                    utils.toggleLoading(el);
                }, 500);
                
            });
        } catch (error) {
            console.log('Error loading data, please try again later');
        }
    }

    const getComments = function() {
        // todo validation;
        utils.toggleLoading(this);
        const url = this.getAttribute('href');
        const postID = this.getAttribute('data-id');
        const el = this;
        renderPostComments(postID);
        try {
            fetch(url)
            .then(response => response.json())
            .then(function(json) {
                
                setTimeout(() => {
                    renderPostComments(postID, json);
                    utils.toggleLoading(el);
                }, 500);
                
            });
        } catch (error) {
            console.log('Error loading data, please try again later');
        }
    }

    const sortPosts = function() {
        console.log('sorting ...');

        if (!Array.isArray(filteredPosts)) return;
        filteredPosts.sort(function(p1, p2) {
            const order = p1.title.localeCompare(p2.title);
            return state.sortingAsc ? order : -order;
        });
        state.sortingAsc = !state.sortingAsc;
        
        renderPosts(filteredPosts);
    };

    const searchPosts = function(searchTerm) {
        console.log('searching ...');
        filteredPosts = posts.filter(function(post) {
            return post.body.indexOf(searchTerm) > -1;
        });
        
        updatePostCount();
            
        renderPosts(filteredPosts);
    };

    const updatePostCount = function() {
        utils.removeChildren(elems.searchCount);
        elems.searchCount.appendChild(doc.createTextNode(filteredPosts.length));
    };

    const renderPosts = function(postsData) {
        const fragment = doc.createDocumentFragment();
        for (const postData of postsData) {
            const postElem = getPostFragment(postData);
            fragment.appendChild(postElem);
        }
        
        utils.removeChildren(elems.posts);
        elems.posts.appendChild(fragment);
    };

    const getPostFragment = function(post) {
        const html = state.view === 'full' ?
            `<div id="post-${post.id}" class="post card mt-2">
                    <div class="card-body">
                        <h3 class="card-title">${post.title}</h3>
                        <div class="post-body card-text"><pre>${post.body}</pre></div>
                    </div>
                    <div class="post-actions card-footer text-end">
                        <a class="post-view-details btn btn-sm btn-outline-secondary" data-id="${post.id}" href="${conf.provider + 'posts/' + post.id}">
                            Show more
                        </a>
                        <a class="post-view-comments btn btn-sm btn-outline-secondary" data-id="${post.id}" href="${conf.provider + 'posts/' + post.id + '/comments'}">
                            Comments
                        </a>
                    </div>
                </div>
                ` 
            :
            `<div id="post-${post.id}" class="post form-check  mt-2">
                <input type="checkbox" id="post-${post.id}-select" class="me-2 form-check-input" value="${post.id}">
                <label class="form-check-label" for="post-${post.id}-select">${post.title} </label>
            </div>
            `;
        
        const fragment = doc.createRange().createContextualFragment(html);
        
        return fragment;
    };

    const renderPostDetails = function(postID, post = null) {
        const postBody = doc.querySelector(`#post-${postID} .post-body pre`);
        utils.removeChildren(postBody);
        if (!post) return;

        postBody.appendChild(doc.createTextNode(post.body));
    };

    const getCommentFragment = function(comment) {
        const html = `
            <div id="comment-${comment.id}" class="comment card mb-2">
                
                <div class="comment-body card-body">
                    <h5 class="card-title">${comment.name}</h5>
                    <div class="card-text">
                        <pre>${comment.body}</pre>
                    </div>
                </div>
                <div class="comment-footer card-footer">
                    By <a href="mailto:${comment.email}">${comment.email}</a>
                </div>
            </div>
            `;
        const fragment = doc.createRange().createContextualFragment(html);
        
        return fragment;
    }

    const renderPostComments = function(postID, commentsData = null) {
        try {
            doc.querySelector(`#post-${postID} .comments`).remove();
        } catch (error) {
            
        }
        if (!commentsData) return;

        const fragment = doc.createDocumentFragment();
        const commentsWrapper = utils.createElement('div', {class: 'comments m-4'});
        
        for (const commentData of commentsData) {
            const elem = getCommentFragment(commentData);
            commentsWrapper.appendChild(elem);
        }
        fragment.appendChild(commentsWrapper);

        doc.querySelector(`#post-${postID}`).appendChild(fragment);
    };

    const exportPosts = function() {
        let selectedIDs = [];
        elems.posts.querySelectorAll(':checked').forEach(elem => {
            selectedIDs.push(Number(elem.value));
        });
        if (!selectedIDs.length) {
            alert('Please select 1 or more posts to export');

            return;
        }
        const postsToExport = filteredPosts.filter(function(post) {
            return selectedIDs.includes(post.id);
        });
        const csv = utils.arrayToCsv(postsToExport);
        var file = new File([csv], "posts.csv", {type: "text/csv;charset=utf-8"});
        saveAs(file);
    };

    const deletePosts = function() {
        let selectedIDs = [];
        elems.posts.querySelectorAll(':checked').forEach(elem => {
            selectedIDs.push(Number(elem.value));
        });
        if (!selectedIDs.length) {
            alert('Please select 1 or more posts to delete');

            return;
        }
        selectedIDs.forEach(id => {
            del(id);
        });
    };

    // event listeners
    doc.getElementById('search').addEventListener('keyup', function(e) {
        searchPosts(this.value);
        //return delay(searchPosts);
    }, false);
    doc.getElementById('sort').addEventListener('click', sortPosts, false);
    doc.getElementById('view-list').addEventListener('click', setViewList, false);
    doc.getElementById('view-full').addEventListener('click', setViewFull, false);
    doc.getElementById('toggle-selection').addEventListener('click', function() {
        setViewList();
        elems.posts.querySelectorAll('.form-check-input').forEach(elem => {
            elem.checked = !elem.checked;
        });
    }, false);
    doc.getElementById('export-selected').addEventListener('click', function() {
        setViewList();
        exportPosts();
    }, false);
    doc.getElementById('delete-selected').addEventListener('click', function() {
        setViewList();
        deletePosts();
    }, false);
    doc.getElementById('new-post-send').addEventListener('click', function() {
        utils.toggleLoading(this);
        const title = utils.sanitize(doc.getElementById('new-post-title').value);
        const body = utils.sanitize(doc.getElementById('new-post-body').value);
        const post = {
            userId: auth.user.id,
            title: title,
            body: body
        };
        set(post);

    }, false);
    elems.newPost.addEventListener('show.bs.modal', function (event) {
        // // Button that triggered the modal
        // var button = event.relatedTarget;
        // // Extract info from data-bs-* attributes
        // var recipient = button.getAttribute('data-bs-whatever');
        // // If necessary, you could initiate an AJAX request here
        // // and then do the updating in a callback.
        // //
        // // Update the modal's content.
        // var modalTitle = exampleModal.querySelector('.modal-title');
        // var modalBodyInput = exampleModal.querySelector('.modal-body input');

        // modalTitle.textContent = 'New message to ' + recipient;
        // modalBodyInput.value = recipient;
    });
    doc.body.addEventListener("click", function (e) {
        if (!e.target) return;
        
        if (e.target.classList.contains("post-view-comments")) {
            const _getComments = getComments.bind(e.target);
            _getComments();

            e.preventDefault();
            return false;
        }
        if (e.target.classList.contains("post-view-details")) {
            const _getPostDetails = getPostDetails.bind(e.target);
            _getPostDetails();

            e.preventDefault();
            return false;
        }
    });
    
    // public methods
    self.foo = function() {

    };

    // init app
    init();

    return self;
})(main || {}, auth, utils);
