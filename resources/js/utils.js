'use strict';

console.log('utils.js');
var utils = (function(parent, utils) {
    const self = (parent = parent || {});
    const doc = document;
    const init = function() {
        console.log('init');
    };

    self.createElement = function(element, attribute, inner='') {
        if (typeof(element) === "undefined") {
            return false;
        }
        const el = document.createElement(element);
        if (typeof(attribute) === 'object') {
            for (let key in attribute) {
            el.setAttribute(key, attribute[key]);
            }
        }
        if (!Array.isArray(inner)) {
            inner = [inner];
        }
        for (let k = 0; k < inner.length; k++) {
            if (inner[k].tagName) {
            el.appendChild(inner[k]);
            } else {
            el.appendChild(document.createTextNode(inner[k]));
            }
        }

        return el;
    }

    self.removeChildren = function(parent) {
        while (parent.lastChild) {
            parent.removeChild(parent.lastChild);
        }
    };

    self.delay = function(callback, ms) {
        var timer = 0;
        return function() {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function () {
            callback.apply(context, args);
          }, ms || 0);
        };
      }
    
    // todo sanitize
    self.sanitize = function(s) {
        console.log(s);
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');;
    };

    self.getSpinner = function(size='sm') {
        const html = `
            <div class="loading spinner-grow spinner-grow-${size}" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            `;

        return doc.createRange().createContextualFragment(html);
    }

    self.toggleLoading = function(el) {
        if(el.classList.contains('loading')) {
            el.classList.remove('loading');
            el.querySelector('.loading').remove();
            return;
        }
        el.classList.add('loading');
        el.appendChild(self.getSpinner());
    };

    /**
     * Take an array of objects of similar structure and convert it to a CSV.
     * @source     https://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/
     * @modifiedBy sators, yanl
     * @param      {Array}  options.data            Array of data
     * @param      {String} options.columnDelimiter Column separator, defaults to ","
     * @param      {String} options.lineDelimiter   Line break, defaults to "\n"
     * @return     {String}                         CSV
     */
    self.arrayToCsv = function(data = null, columnDelimiter = ",", lineDelimiter = "\r\n") {
        let result, ctr, keys, col;

        if (data === null || !data.length) {
            return null;
        }

        keys = Object.keys(data[0]);

        result = "";
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        data.forEach(item => {
            ctr = 0;
            keys.forEach(key => {
                if (ctr > 0) {
                    result += columnDelimiter;
                }
                
                if (typeof item[key] === "string") {
                    col = item[key].replace(/(\r\n|\n|\r)/gm, " ");
                } else {
                    col = item[key];
                }
                
                result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `"${col}"` : col;
                ctr++;
            })

            result += lineDelimiter;
        })

        return result;
    };

    self.modal = function() {
        const html = 
            `<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="staticBackdropLabel">Select post</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            Please select at least 1 post to export
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    init();

    return self;
})(utils || {});