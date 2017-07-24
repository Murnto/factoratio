/**
 * Created by synopia on 27.06.2014.
 */
var model = {
  productions: {},
  treeLines: {},
  id: 0,
  init: function() {
    model.id = 0;
    model.productions = {};
    model.treeLines = {};
    model.dupes = {};
  },
  buildProductionTree: function (parentItem, item, relativeSpeed, parentLockSpeed, dupeCheck) {
    var data = [];
    var recipe = recipes[item];
    var production = model.productions[item];
    if (production == null) {
      model.productions[item] = production = {relativeSpeed: 0, item: item, outputs: {}};
    }
    production.relativeSpeed += relativeSpeed;
    if (parentItem) {
      if (production.outputs[parentItem] == null) {
        production.outputs[parentItem] = 0
      }
      production.outputs[parentItem] += relativeSpeed;
    }
    
    dupeCheck[item] = {item: item, data: data, duped: false};
    
    if (recipe) {
      $.each(recipe.ingredients, function(index, list) {
        var ingredient = list[0];
        var amount = list[1];

        if (!dupeCheck[ingredient]) {
          var childDupeCheck = $.extend({}, dupeCheck);
          data.push(model.buildProductionTree(item, ingredient, relativeSpeed * amount / recipe.resultCount, parentLockSpeed, childDupeCheck));
        } else {
          // console.log('dupe at', dupeCheck[ingredient], data);
          
          dupeCheck[ingredient].duped = true;
          recipes[ingredient] = undefined; // allows resources to have proper names
          model.dupes[ingredient] = true;

          data.push(model.insertLine("p", undefined, undefined, [], true, parentLockSpeed));
        }
      });
    }
    return model.insertLine("p", item, relativeSpeed, model.dupes[item] ? [] : data, true, parentLockSpeed);
  },
  buildRatioTree: function() {
    var data = [];
    $.each(model.productions, function(item, production) {
      var outputs = [];
      $.each(production.outputs, function(outputItem, speed) {
        var line = model.insertLine("r", outputItem, speed / production.relativeSpeed, undefined, true, logic.targetSpeed);
        outputs.push(line);
      });
      var line = model.insertLine("r", item, production.relativeSpeed, outputs, false, logic.targetSpeed);
      data.push(line);
    });
    return data;
  },
  insertLine: function (type, item, speed, children, open, parentLockSpeed) {
    model.id++;
    var uniqueId = type + "_" + model.id;
    var line = {
      id: uniqueId,
      value: helpers.getName(item),
      item: item,
      relativeSpeed: speed,
      open: open == undefined ? true : open,
      data: children,
      lockSpeed: parentLockSpeed
    };
    model.treeLines[uniqueId] = line;
    return line;
  }
};
