/*jshint browser:true, indent:2, globalstrict: true, laxcomma: true, laxbreak: true */
/*global d3:true */

/*
 * colorlegend
 *
 * This script can be used to draw a color legend for a 
 * [d3.js scale](https://github.com/mbostock/d3/wiki/Scales) 
 * on a specified html div element. 
 * [d3.js](http://mbostock.github.com/d3/) is required.
 *
 */

'use strict';

var colorlegend = function (target, scale, type, options) {

  // check for valid input - 'quantize' not included
  var scaleTypes = ['linear', 'quantile', 'ordinal'];
  var found = false;
  for (var i = 0 ; i < scaleTypes.length ; i++) {
    if (scaleTypes[i] === type) {
      found = true;
      break;
    }
  }
  if (! found)
    throw new Error('Scale type, ' + type + ', is not suported.');

  // empty options if none were passed
  var opts = options || {};
  
  // options or use defaults
  var boxWidth = opts.boxWidth || 20;     // width of each box (int)
  var boxHeight = opts.boxHeight || 20;   // height of each box (int)
  var title = opts.title || null;         // draw title (string)
  var fill = opts.fill || false;          // fill the element (boolean)
  var linearBoxes = opts.linearBoxes || 9; // number of boxes for linear scales (int)
  
  // get width and height of the target element - strip the prefix #
  var htmlElement;
  if (target.substring(0, 1) === '#') {
    htmlElement = document.getElementById(target.substring(1, target.length));
  }
  else {
    htmlElement = document.getElementById(target);
  }
  var w = htmlElement.offsetWidth;
  var h = htmlElement.offsetHeight;
  
  // set padding for legend and individual boxes
  var padding = [2, 4, 10, 4]; // top, right, bottom, left
  var boxSpacing = type === 'ordinal' ? 3 : 0; // spacing between boxes
  var titlePadding = title ? 11 : 0;
  
  // properties of the scale that will be used
  var domain = scale.domain();
  var range = scale.range();
  
  // setup the colors to use
  var colors = [];
  if (type === 'quantile') {
    colors = range;
  }
  else if (type === 'ordinal') {
    for (var i = 0 ; i < domain.length ; i++) {
      colors[i] = range[i];
    }
  }
  else if (type === 'linear') {
    var min = domain[0];
    var max = domain[domain.length - 1];
    for (var i = 0; i < linearBoxes ; i++) {
      colors[i] = scale(i * ((max - min) / linearBoxes));
    }
  }
  
  // check the width and height and adjust if necessary to fit in the element
  // use the range if quantile
  if (fill || w < (boxWidth + boxSpacing) * colors.length + padding[1] + padding[3]) {
    boxWidth = (w - padding[1] - padding[3] - (boxSpacing * colors.length)) / colors.length;
  }
  if (fill || h < boxHeight + padding[0] + padding[2] + titlePadding) {  
    boxHeight = h - padding[0] - padding[2] - titlePadding;    
  }
  
  // set up the legend graphics context
  var legend = d3.select(target)
    .append('svg')
      .attr('width', w)
      .attr('height', h)
    .append('g')
      .attr('class', 'colorlegend')
      .attr('transform', 'translate(' + padding[3] + ',' + padding[0] + ')')
      .style('font-size', '11px')
      .style('fill', '#666');
      
  var legendBoxes = legend.selectAll('g.legend')
      .data(colors)
    .enter().append('g');

  // value labels
  legendBoxes.append('text')
      .attr('class', 'colorlegend-labels')
      .attr('dy', '.71em')
      .attr('x', function (d, i) {
        return i * (boxWidth + boxSpacing) + (type !== 'ordinal' ? (boxWidth / 2) : 0);
      })
      .attr('y', function () {
        return boxHeight + 2;
      })
      .style('text-anchor', function () {
        return type === 'ordinal' ? 'start' : 'middle';
      })
      .style('pointer-events', 'none')
      .text(function (d, i) {
        // show label for all ordinal values
        if (type === 'ordinal') {
          return domain[i];
        }
        // show only the first and last for others
        else {
          if (i === 0)
            return domain[0];
          if (i === colors.length - 1) 
            return domain[domain.length - 1];
        }
      });
      
        
        
  legendBoxes.append('rect')
      .attr('x', function (d, i) { 
        return i * (boxWidth + boxSpacing);
      })
      .attr('width', boxWidth)
      .attr('height', boxHeight)
      .style('fill', function (d, i) { return colors[i]; });
  
  // show a title in center of legend (bottom)
  if (title) {
    legend.append('text')
        .attr('class', 'colorlegend-title')
        .attr('x', (colors.length * (boxWidth / 2)))
        .attr('y', boxHeight + titlePadding)
        .attr('dy', '.71em')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text(title);
  }
    
  return this;
};