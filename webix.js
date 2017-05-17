/**
 * Created by synopia on 27.06.2014.
 */
var ui_scheme = {
  type: "space",
  rows: [{
    view: "toolbar",
    cols: [{
      view: "label",
      label: "<strong>Factoratio</strong>",
      fillspace: true
    }, {
      view: "checkbox",
      labelRight: "<span style='color: white'>Lock speed</span>",
      labelWidth: 0, // affects the width of left label
      labelPosition: "right",
      width: 95,
      value: 0,
      on: {
        onChange: function (newv, oldv) {
          logic.updateLockSpeed(newv);
        }
      }
    }, {
      view: "button",
      label: "Setup",
      width: 60,
      popup: "setup"
    }, {
      view: "button",
      label: "Refresh",
      width: 60,
      click: function() {
        logic.updateRecipes();
      }
    }, {
      view: "button",
      type: "danger",
      label: "Reset",
      width: 60,
      click: function() {
        logic.reset();
      }
    }]
  }, {
    cols: [{
      view: "combo",
      label: "Recipe",
      suggest: {
        filter: function (item, value) {
          if (item.value.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0) return true;

          return item.id.toString().toLowerCase().indexOf(value.toLowerCase()) >= 0;
        },
        data: selectRecipes
      },
      id: "selected_recipe"
    }, {
      view: "counter",
      min: 1,
      max: 120,
      width: 103,
      id: "selected_recipe_speed",
      on: {
        onChange: function(newv, oldv) {
          logic.updateTargetSpeed(newv);
        }
      }
    }, {
      view: "richselect",
      id: "selected_unit",
      options: [{id:1, value:"u/s"}, {id:2, value:"u/m"}, {id:3, value:"u/h"}],
      value:2,
      width: 100,
      on: {
        onChange: function(newv, oldv) {
          logic.updateTargetSpeed($$("selected_recipe_speed").getValue());
        }
      }
    }, {
      view: "button",
      type: "form",
      label: "Add",
      width: 40,
      click: function() {
        logic.addRecipe($$("selected_recipe").getValue());
      }
    }, {
      view: "button",
      type: "danger",
      label: "Remove",
      width: 60,
      click: function() {
        logic.removeRecipe($$("selected_recipe").getValue());
      }
    }, ]
  }, {
    view: "tabview",
    id: "tabs",
    animate: false,
    cells: [{
      header: "Recipe view",
      body: {
        view: "treetable",
        id: "recipe_tree",
        editable: true,
        editaction: 'click',
        tooltip: true,
        scrollX:false,
        columns: [{
          id: "targetSpeed",
          header: "u/m",
          template: helpers.renderSpeed,
          format: helpers.speedFormat,
          width: 100,
          tooltip: false
        }, {
          id: "name",
          header: "Item",
          fillspace: 300,
          template: "{common.space()}{common.icon()} &nbsp;#value#",
          tooltip: false
        }, {
          id: "count",
          header: "Count",
          template: helpers.renderCount,
          width: 100,
          tooltip: tooltips.count
        }, {
          id: "factorySpeed",
          header: "u/m/factory",
          format: helpers.speedFormat,
          width: 100,
          tooltip: tooltips.factorySpeed
        }, {
          id: "factory",
          header: "Factory",
          editor: 'myselect',
          fillspace: 225,
          template: helpers.renderFactory,
          options: logic.selectFactories,
          tooltip: tooltips.factory
        }, {
          id: "inputInserters",
          header: "Input inserters",
          editor: 'myselect',
          fillspace: 225,
          template: helpers.renderInputInserters,
          options: logic.selectInserters,
          tooltip: tooltips.inputInserters
        }, {
          id: "outputInserters",
          header: "Output inserters",
          editor: 'myselect',
          fillspace: 225,
          template: helpers.renderOutputInserters,
          options: logic.selectInserters,
          tooltip: tooltips.outputInserters
        }]
      }
    }, {
      header: "Ratio view",
      body: {
        view: "treetable",
        id: "ratio_tree",
        editable: true,
        editaction: 'click',
        tooltip: true,
        columns: [{
          id: "targetSpeed",
          header: "u/m",
          template: helpers.renderSpeedRatio,
          width: 100,
          tooltip: false
        }, {
          id: "name",
          header: "Item",
          fillspace: 300,
          template: "{common.space()}{common.icon()} &nbsp;#value#",
          tooltip: false
        }, {
          id: "count",
          header: "Count",
          template: helpers.renderCount,
          width: 100,
          tooltip: tooltips.count
        }, {
          id: "factorySpeed",
          header: "u/m/factory",
          format: helpers.speedFormat,
          width: 100,
          tooltip: tooltips.factorySpeed
        }, {
          id: "factory",
          header: "Factory",
          editor: 'myselect',
          fillspace: 225,
          template: helpers.renderFactory,
          options: logic.selectFactories,
          tooltip: tooltips.factory
        }, {
          id: "inputInserters",
          header: "Input inserters",
          editor: 'myselect',
          fillspace: 225,
          template: helpers.renderInputInserters,
          options: logic.selectInserters,
          tooltip: tooltips.inputInserters
        }, {
          id: "outputInserters",
          header: "Output inserters",
          editor: 'myselect',
          fillspace: 225,
          template: helpers.renderOutputInserters,
          options: logic.selectInserters,
          tooltip: tooltips.outputInserters
        }]
      }
    }]
  }]
};
function buildData(factories, categories, notcategories) {
  var result = [];
  $.each(factories, function(index, factory) {
    var found = notcategories;
    if (categories) {
      for (var i = 0; i < factory.categories.length; i++) {
        var category = factory.categories[i];
        if (categories.indexOf(category) != -1) {
          found = !notcategories;
          break;
        }
      }
    } else {
      found = true
    }
    if (found) {
      result.push({id: factory.id, name: factory.name, checked: true})
    }
  });
  result.sort(function(a, b) {
    return a.name.localeCompare(b.name)
  });
  return result;
}
var selectableData = []
selectableData.push({name: "Assembling Machines", open: true, data: buildData(factories, ["crafting"])});
selectableData.push({name: "Mining", open: true, data: buildData(factories, ["basic-solid"])});
selectableData.push({name: "Smelting", open: true, data: buildData(factories, ["smelting"])});
selectableData.push({name: "Fluid", open: true, data: buildData(factories, ["basic-fluid", "oil-processing", "fluid", "chemistry"])});
selectableData.push({name: "Inserters", open: true, data: buildData(inserters)});
selectableData.push({name: "Other", open: true, data: buildData(factories, ["basic-fluid", "oil-processing", "fluid", "chemistry", "smelting", "basic-solid", "crafting"], true)});
var ui_setup = {
  view: "popup",
  id: "setup",
  position: "center",
  width: 400,
  minHeight: 300,
  maxHeight: 650,
  body: {
    view: "tree",
    id: "setup_tree",
    threeState: true,
    editable: true,
    borderless: true,
    template: "{common.space()} {common.checkbox()} &nbsp; #name#",
    on: {
      onItemCheck: function() {
        logic.updateRecipes();
      }
    },
    data: selectableData
  }
};
