/*package annotator.ui.tags */
"use strict";

var util = require('../util');

var $ = util.$;
var _t = util.gettext;

// our sample JSON-LD
var json_ld = {
    "@context": "http://www.w3.org/ns/oa-context-20130208.json",
    "@type" : "oa:SemanticTag",
    "@id": "http://www.example.org/annotations/",
    "page": ""
};

// Take an array of tags and turn it into a string suitable for display in the
// viewer.
function stringifyTags(array) {
    var tag_names = [];
    for(var i in array) {
      tag_names.push(array[i]["page"]);
    }
    return tag_names.join(" ");
}


// Take a string from the tags input as an argument, and return an array of
// tags.
function parseTags(string) {
	  string = $.trim(string);
    var tags = [], tag_names = [];

    if (string) {
        tag_names = string.split(/\s+/);
    }

	  for(var i in tag_names) {
        // prepare each tag with the sample JSON-LD
		    var tag = $.extend({}, json_ld); // shallow copy for now should work
        // prepare the @id field appropriately
        tag["@id"] += "tag" + i;
        // page attr of the tag is the given string by the user
        tag["page"] = tag_names[i];
        tags.push(tag);
	  }

    return tags;
}


/**
 * function:: viewerExtension(viewer)
 *
 * An extension for the :class:`~annotator.ui.viewer.Viewer` that displays any
 * tags stored as an array of strings in the annotation's ``tags`` property.
 *
 * **Usage**::
 *
 *     app.include(annotator.ui.main, {
 *         viewerExtensions: [annotator.ui.tags.viewerExtension]
 *     })
 */
exports.viewerExtension = function viewerExtension(v) {
    function updateViewer(field, annotation) {
        field = $(field);
        if (annotation.tags &&
            $.isArray(annotation.tags) &&
            annotation.tags.length) {
            field.addClass('annotator-tags').html(function () {
                return $.map(annotation.tags, function (tag) {
                    return '<span class="annotator-tag">' +
                        util.escapeHtml(JSON.stringify(tag)) +
                        '</span>';
                }).join(' ');
            });
        } else {
            field.remove();
        }
    }

    v.addField({
        load: updateViewer
    });
};


/**
 * function:: editorExtension(editor)
 *
 * An extension for the :class:`~annotator.ui.editor.Editor` that allows
 * editing a set of space-delimited tags, retrieved from and saved to the
 * annotation's ``tags`` property.
 *
 * **Usage**::
 *
 *     app.include(annotator.ui.main, {
 *         viewerExtensions: [annotator.ui.tags.viewerExtension]
 *     })
 */
exports.editorExtension = function editorExtension(e) {
    // The input element added to the Annotator.Editor wrapped in jQuery.
    // Cached to save having to recreate it everytime the editor is displayed.
    var field = null;
    var input = null;

    function updateField(field, annotation) {
        var value = '';
        if (annotation.tags) {
            value = stringifyTags(annotation.tags);
        }
        input.val(value);
    }

    function setAnnotationTags(field, annotation) {
        annotation.tags = parseTags(input.val());
    }

    field = e.addField({
        label: _t('Add some tags here') + '\u2026',
        load: updateField,
        submit: setAnnotationTags
    });

    input = $(field).find(':input');
};
