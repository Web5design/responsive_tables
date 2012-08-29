/**
 * table.js
 *
 * Behaviors to facilitate interactivity with tables.
 */
(function ($) {

"use strict";

  /**
   * Attach the table function to Drupal.behaviors.
   */
  Drupal.behaviors.table = {
    attach: function (context, settings) {
      $(context).find('table').once('table', function () {
        $(this).data("drupal-table", new Drupal.Table(this));
      });
    }
  };
  /**
   * The Table manages behaviors that enhance table element interactivity.
   */
  Drupal.Table = function (table) {
    var self = this;
    this.$table = $(table);
    this.actions = $();
    this.hasActions = false;
    // Build a link that will toggle the column visibility.
    this.$actionsContainer = $('<div>', {
      'class': 'table-actions'
    })
    .data('drupal-table', {});
  };
  /**
   * Add a link to perform an action on the table to the list of table actions.
   *
   * @param actions: actions may be an object or an array of action objects.
   * An action object has the following structure:
   *
   * action = {
   *   'href': 'url',
   *   'text': 'string',
   *   'attributes': {
   *     'title': 'title attribute description',
   *     'class': 'string of classes'
   *   },
   *   'callback': function () {}
   * };
   */
  Drupal.Table.prototype.addAction = function (actions) {
    // Keep a list of actions added during this method call.
    var newActions = $();
    // Actions could be a single action or an array.
    if (!$.isArray(actions)) {
      actions = [actions];
    }
    // If the table does not have any actions yet, prepend the container
    // that will display them.
    if (!this.hasActions) {
      this.$actionsContainer.insertBefore(this.$table);
    }
    // Append the actions to the list of table actions.
    for (var i = 0; i < actions.length; i++) {
      var link;
      var action = actions[i];
      // If the action doesn't have a callback, there is no reason to proceed.
      if ('callback' in action && typeof action.callback === 'function') {
        var attributes = $.extend({}, ('attributes' in action && typeof action.attributes === 'object') ? action.attributes : {});
        this.$actionsContainer.append(
          link = $('<a>', {
            'href': ('href' in action) ? action.href : '#',
            'text': ('text' in action) ? Drupal.t(action.text) : Drupal.t('No text provided'),
            'title': ('title' in attributes) ? Drupal.t(attributes.title) : '',
            'class': ('class' in attributes) ? attributes['class'] : '',
            // Aria information.
            'role': 'button',
          })
          .on({
            'click': action.callback
          })
        );
        newActions = $().add(newActions).add(link);
      }
    }
    // Store the actions added in this object's list of actions.
    this.actions = $().add(this.actions).add(newActions);
    // Return just the actions that were added.
    return newActions;
  };
})(jQuery);
