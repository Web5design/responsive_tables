/**
 * tableresponsive.js
 *
 * Behaviors to facilitate the presentation of tables across screens of any size.
 */
(function ($) {

"use strict";

  /**
   * Attach the responsiveTable function to Drupal.behaviors.
   */
  Drupal.behaviors.responsiveTable = {
    attach: function (context, settings) {
      $(context).find('table.responsive-enabled').once('tableresponsive', function () {
        $(this).data("drupal-tableresponsive", new Drupal.responsiveTable(this));
      });
    }
  };
  /**
   * A responsive table hides columns at small screen sizes, leaving the most
   * important columns visible to the end user. Users should not be prevented from
   * accessing all columns, however. This class adds a toggle to a table with
   * hidden columns that exposes the columns. Exposing the columns will likely
   * break layouts, but it provides the user with a means to access data, which
   * is a guiding principle of responsive design.
   */
  Drupal.responsiveTable = function (table) {
    var self = this;
    this.$table = $(table);
    this.showText = Drupal.t('Show all columns');
    this.hideText = Drupal.t('Hide unimportant columns');
    // Build a link that will toggle the column visibility.
    this.$columnToggle = $('<a>', {
      'href': '#',
      'text': this.showText,
      'class': 'responsive-table-toggle'
    })
    .data('drupal-tableresponsive', {})
    .bind('click.drupal-tableresponsivetable', $.proxy(this, 'eventhandlerToggleColumns'));
    // Store a reference to the header elements of the table so that the DOM is
    // traversed only once to find them.
    this.$headers = this.$table.find('th');
    // Attach a resize handler to the window.
    $(window)
      .bind('resize.drupal-tableresponsivetable', Drupal.debounce($.proxy(this, 'eventhandlerEvaluateColumnVisibility'), 250))
      .triggerHandler('resize.drupal-tableresponsivetable');
  };
  /**
   * Associates an action link with the table that will show hidden columns.
   * Columns are assumed to be hidden if their header's display property is none
   * or if the visibility property is hidden.
   */
  Drupal.responsiveTable.prototype.eventhandlerEvaluateColumnVisibility = function (event) {
    var self = this;
    var $headers = this.$headers;
    var $toggle = this.$columnToggle;
    var $hiddenHeaders = $headers.filter(':hidden');
    var hiddenLength = $hiddenHeaders.length;
    var toggleData = $toggle.data('drupal-tableresponsive');
    // If the table has hidden columns, associate an action link with the table
    // to show the columns.
    if (hiddenLength > 0) {
      $toggle
      .insertBefore(this.$table);
    }
    // When the toggle is sticky, its presence is maintained because the user has
    // interacted with it. This is the necessary to keep the link visible if the user
    // adjusts screen size and changes the visibilty of columns.
    if ((!('sticky' in toggleData) && hiddenLength === 0) || ('sticky' in toggleData && !toggleData.sticky && hiddenLength === 0)) {
      $toggle.detach();
      delete this.$columnToggle.data('drupal-tableresponsive').sticky;
    }
  };
  /**
   * Reveal hidden columns and hide any columns that were revealed because they were
   * previously hidden.
   */
  Drupal.responsiveTable.prototype.eventhandlerToggleColumns = function (event) {
    event.preventDefault();
    var self = this;
    var $headers = this.$headers;
    var $hiddenHeaders = this.$headers.filter(':hidden');
    this.$revealedCells = this.$revealedCells || $();
    // Reveal hidden columns.
    if ($hiddenHeaders.length > 0) {
      $hiddenHeaders.each(function (index, element) {
        var $header = $(this);
        var position = Number($header.prevAll('th').length);
        $('tbody tr', this.$table).each(function (index, element) {
          var $row = $(this);
          var $cells = $row.find('td:eq(' + position + ')');
          $cells.show();
          // Keep track of the revealed cells, so they can be hidden later.
          self.$revealedCells = $().add(self.$revealedCells).add($cells);
        });
        $header.show();
        // Keep track of the revealed headers, so they can be hidden later.
        self.$revealedCells = $().add(self.$revealedCells).add($header);


      });
      this.$columnToggle.text(this.hideText);
      this.$columnToggle.data('drupal-tableresponsive').sticky = true;
    }
    // Hide revealed columns.
    else {
      this.$revealedCells.hide();
      this.$columnToggle.text(this.showText);
      // Strip out display
      this.$revealedCells.each(function (index, element) {
        var $cell = $(this);
        var style = $cell.attr('style');
        var properties = style.split(';');
        var newProps = [];
        // The columns should simply have the display table-cell property
        // removed, which the jQuery hide method does. The hide method
        // also adds display none to the element. The element should be
        // returned to the same state it was in before the columns were
        // revealed, so it is necessary to remove the display none
        // value from the style attribute.
        for (var i = 0; i < properties.length; i++) {
          var prop = properties[i]
          prop.trim();
          // Find the display:none property and remove it.
          var isDisplayNone = /^display\s*\:\s*none$/.exec(prop);
          if (isDisplayNone) {
            continue;
          }
          newProps.push(prop);
        }
        // Return the rest of the style attribute values to the element.
        $cell.attr('style', newProps.join(';'));
      });
      delete this.$revealedCells;
      this.$columnToggle.data('drupal-tableresponsive').sticky = false;
      // Refresh the toggle link.
      $(window)
      .triggerHandler('resize.drupal-tableresponsivetable');
    }
  };
})(jQuery);
