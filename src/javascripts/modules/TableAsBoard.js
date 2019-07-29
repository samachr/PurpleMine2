var PurpleMine = PurpleMine || {} // eslint-disable-line no-use-before-define

PurpleMine.TableAsBoard = (function () {
  'use strict'

  var instance

  function dragSprintItem(event) {
    event.dataTransfer.dropEffect = "move";
    document.querySelectorAll('.issue_drop').forEach(function (node) {
      node.style.visibility = 'visible';
      event.target.style.backgroundColor = '#';
    });
    instance.dragged = event.target;
  }

  function stopDragSprintItem(event) {
    document.querySelectorAll('.issue_drop').forEach(function (node) {
      node.style.visibility = 'hidden';
      event.target.style.backgroundColor = '#';
    });
    instance.dragged = null
  }

  function drop(event) {
    event.preventDefault();
    event.target.style.backgroundColor = '#';
    var groupName = event.target.getAttribute('data-group-name');
    $('#' + instance.dragged.id).trigger('contextmenu');

    function clickWhenAvailable() {
      var contextMenu = document.querySelector("#context-menu");
      if (contextMenu && contextMenu.style.display != 'none') {
        contextMenu.style.display = 'none';
        $('#context-menu > ul > li > ul > li > a:contains("' + groupName + '")').click();
      } else {
        setTimeout(function () {
          clickWhenAvailable();
        }, 100);
      }
    }

    clickWhenAvailable();
  }

  function allowDrop(event) {
    event.preventDefault();
  }

  function dragEnter(event) {
    event.target.style.backgroundColor = 'gray';
  }

  function dragLeave(event) {
    event.target.style.backgroundColor = '#';
  }

  function createDropElement(row, column, groupName) {
    var node = document.createElement("tr");
    node.setAttribute('data-group-name', groupName);
    node.classList.add('issue');
    node.classList.add('issue_drop');
    node.style.gridRow = row;
    node.style.gridColumn = column;
    node.style.visibility = 'hidden';
    node.ondrop = drop;
    node.ondragover = allowDrop;
    node.ondragenter = dragEnter;
    node.ondragleave = dragLeave;
    node.appendChild(document.createTextNode('Drop Issue Here'));
    return node;
  }


  function TableAsBoard () {
    if (instance) {
      return instance
    }

    instance = this

    this.dragged = null;

    handleTableAsBoard()
  }

  function handleTableAsBoard () {
    if (document.querySelector('table.issues > tbody > tr.group')) {
      if (document.querySelector('p.buttons')) {
        var node = document.createElement("A");
        node.style.cursor = 'pointer';
        node.style.float = 'right';
        node.appendChild(document.createTextNode("View As Board"));
        node.onclick = instance.showTableAsBoard;
        document.querySelector('p.buttons').appendChild(node);
      } else if (document.querySelector('div.mypage-box')) {
        document.querySelectorAll('div.mypage-box > h3').forEach(function(header) {
          var node = document.createElement("A");
          node.style.cursor = 'pointer';
          node.style.float = 'right';
          node.appendChild(document.createTextNode("View As Board"));
          node.onclick = instance.showTableAsBoard
          header.appendChild(node);
        });
      }

      if (JSON.parse(localStorage.getItem('redmine-issue-list-as-board'))) {
        instance.showTableAsBoard();
        var currentStatus = JSON.parse(localStorage.getItem('redmine-issue-list-as-board'))
        localStorage.setItem('redmine-issue-list-as-board', !currentStatus)
      }
    }
  }

  TableAsBoard.prototype.showTableAsBoard = function () {
    var currentStatus = JSON.parse(localStorage.getItem('redmine-issue-list-as-board'));
    localStorage.setItem('redmine-issue-list-as-board', !currentStatus);

    document.querySelector("table.issues").classList.toggle('sprint-view');
    var tbody = document.querySelector("table.sprint-view > tbody");

    if (tbody) {
      var currentColumn = 0;
      var currentRow = 1;
      var dropZones = [];
      var currentGroupName = "";
      for (var i = 0; i < tbody.children.length; i++) {
        var item = tbody.children[i];
        if (item.classList.contains('group')) {
          if (currentRow != 1) {
            // add drop area
            dropZones.push(createDropElement(currentRow, currentColumn, currentGroupName));
          }
          currentGroupName = item.querySelector('td > span.name').textContent;
          currentRow = 1;
          currentColumn += 1;
        } else {
          item.setAttribute('draggable', 'true');
          item.ondragstart = dragSprintItem;
          item.ondragend = stopDragSprintItem;
        }
        item.style.gridRow = currentRow;
        item.style.gridColumn = currentColumn;
        currentRow += 1;
      }

      var columnsString = 'auto';
      for (var i = 1; i < currentColumn; i++) {
        columnsString += ' auto';
      }
      tbody.style.gridTemplateColumns = columnsString;

      dropZones.push(createDropElement(currentRow, currentColumn, currentGroupName));
      dropZones.forEach(function(node) {tbody.appendChild(node)});
    }
  }

  return TableAsBoard
}())
