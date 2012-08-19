/**
 *
 */
(function ($) {
  Drupal.behaviors.responsiveTable = {
    attach: function (context, settings) {
      $(context).find('table').not('.sticky-header').once('responsivetable', function () {
        $(this).data("drupal-responsive", new Drupal.responsiveTable(this));
      });
    }
  };
  /**
   *
   */
  Drupal.responsiveTable = function (table) {
    var self = this;
    this.$table = $(table);
    this.showText = Drupal.t('Show all columns');
    this.hideText = Drupal.t('Hide unimportant columns');
    
    this.$columnToggle = $('<a>', {
      'href': '#',
      'text': this.showText,
      'class': 'responsive-table-toggle'
    })
    .data('drupal-responsive', {})
    .bind('click.drupal-responsivetable', $.proxy(this, 'eventhandlerToggleColumns'));
    this.$headers = this.$table.find('th');
    // 
    $(window)
      .bind('resize.drupal-responsivetable', $.proxy(this, 'eventhandlerEvaluateColumnVisibility'))
      .triggerHandler('resize.drupal-responsivetable');
  };
  /**
   *
   */
  Drupal.responsiveTable.prototype.eventhandlerEvaluateColumnVisibility = function (event) {
    var self = this;
    var $headers = this.$headers;
    var $toggle = this.$columnToggle;
    var $hiddenHeaders = $headers.filter(':hidden');
    var hiddenLength = $hiddenHeaders.length;
    var toggleData = $toggle.data('drupal-responsive');

    if (hiddenLength > 0) {
      $toggle
      .insertBefore(this.$table);
    }
    if ('sticky' in toggleData && !toggleData.sticky && hiddenLength === 0) {
      $toggle.detach();
      delete this.$columnToggle.data('drupal-responsive').sticky;
    }
  };
  /**
   *
   */
  Drupal.responsiveTable.prototype.eventhandlerToggleColumns = function (event) {
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
          self.$revealedCells = $().add(self.$revealedCells).add($cells);
        });
        $header.show();
        self.$revealedCells = $().add(self.$revealedCells).add($header);
        
        
      });
      this.$columnToggle.text(this.hideText);
      this.$columnToggle.data('drupal-responsive').sticky = true;
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
        for (var i = 0; i < properties.length; i++) {
          var prop = properties[i]
          prop.trim();
          var isDisplayNone = /^display\s*\:\s*none$/.exec(prop);
          if (isDisplayNone) {
            continue;
          }
          newProps.push(prop);
        }
        $cell.attr('style', newProps.join(';'));
      });
      // Find the display:none property and remove it.
      delete this.$revealedCells;
      this.$columnToggle.data('drupal-responsive').sticky = false;
      $(window)
      .triggerHandler('resize.drupal-responsivetable');
    }
  };
})(jQuery);