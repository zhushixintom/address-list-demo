/** 
* Contact List V1.0.0 
* By Tom Zhu
*/
/**
 * Contact List V1.0.0
 * By Tom Zhu
 */
(function() {
    'use strict';
    // global object for contacts
    $.contacts = $.contacts || {};
    $.contacts.getContacts = getContacts;
    $.contacts.searchContacts = searchContacts;
    $.contacts.list = {};
    $.contacts.showList = {};
    $.contacts.searchList = {};
    $.contacts.searchList.people = [];
    // alphabet
    var alphabet = true;

    /**
     * Grab contacts from API server
     * @param
     * @return
     */
    function getContacts(param) {
        var url = param.url;
        var input = $(param.input);
        var output = $(param.output);

        $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json',
                data: {}
            })
            .done(function(contacts) {
                $('#loading').modal('hide');
                $.contacts.list.people = contacts;
                showContacts($.contacts.list.people);
                $.contacts.searchContacts(contacts, input, output);
                console.log("success");
            })
            .fail(function() {
                console.log("error");
                $('.container').html("<div class='text-center'>Network error, please contact the administrator!</div>");
            })
            .always(function() {
                console.log("complete");
            });
    }

    /**
     * Show contacts
     * @param {contacts} which grabbed from the server
     * @return Html
     */
    function showContacts(contacts) {
        if (contacts.length == 0) {
            return;
        }
        contacts.sort(bykey("name"));
        // process the data. insert a letter before the lists with this initial letter end
        // storage the current letter
        var pre = "";
        // new array for the processed data
        var newContacts = [];
        // storage the number for the same initial letter
        var num = 0;
        // storage the index of the inserted element in the new array
        var index = 0;
        // storage how many new records we insert
        var j = 0;

        for (var i = 0; i <= contacts.length; i++) {
            // storage the object of the initial letter separator
            var tempObj = {};
            if (i == 0) {
                pre = contacts[0].name.slice(0, 1).toUpperCase();
                tempObj.capital = pre;
                index = 0;
                newContacts.push(tempObj);
                newContacts.push(contacts[i]);
            } else if (i < contacts.length) {
                var next = contacts[i].name.slice(0, 1).toUpperCase();
                if (next == pre) {
                    newContacts.push(contacts[i]);
                } else {
                    tempObj.capital = next;
                    newContacts.push(tempObj);
                    j++;
                    newContacts.push(contacts[i]);
                    newContacts[index].dindex = num;
                    num = 0;
                    index = i + j;
                }
                pre = next;
            } else {
                newContacts[index].dindex = num;
            }
            num++;
        }
        var compiledTemplate = Template7.compile($('#contactsTpl').html());
        $.contacts.showList.people = newContacts;
        var html = compiledTemplate($.contacts.showList);
        $("#contact-list .list-group").html("").append(html);
    }

    /**
     * Sort an array with object elements
     * @param  {key} the key of the object in an Array you want sort by
     * @return Boolean
     */
    var bykey = function(key) {
      return function(o, p) {
          var a, b;
          if (typeof o === "object" && typeof p === "object" && o && p) {
              a = o[key];
              b = p[key];
              if (a === b) {
                  return 0;
              }
              if (alphabet == false) {
                  if (typeof a === typeof b) {
                      return a < b ? 1 : -1;
                  }
                  return typeof a < typeof b ? 1 : -1;
              } else {
                  if (typeof a === typeof b) {
                      return a < b ? -1 : 1;
                  }
                  return typeof a < typeof b ? -1 : 1;
              }
          } else {
              throw ("error");
          }
      }
    }

    /**
     * Show the individual contact in a popup
     * @param
     * @return
     */
    $('#myModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        var recipient = button.data('id'); // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this);

        var singleContact = $.contacts.list.people.filter(function(item) {
            return item.id == recipient;
        });
        var compiledTemplate = Template7.compile($('#singleContactsTpl').html());
        var html = compiledTemplate(singleContact[0]);
        // singleContact is array, which nests obj

        modal.find('.modal-title').text(singleContact[0].name)
        modal.find('.modal-body').html(html);
    })

    /**
     * Search function
     * @param
     * @return
     */
    function searchContacts(list, input, output) {

        // Variable for input value
        var searchVal;
        // Array storages the names of list
        var names = [];
        // Set names alphabet 'true'
        names.alphabet = true;
        // Array storages the search result
        var searchArray;
        // temp variable
        var temp;

        for (var i = 0; i <= list.length - 1; i++) {
            temp = i;
            names.push(list[temp].name.toLowerCase());
        }

        // keyup can be changed by property change
        input.on("input propertychange", function() {
            searchVal = input.val().toLowerCase();
            if(searchVal == ""){
              showContacts($.contacts.list.people);
            }

            $.contacts.searchList.people = [];

            var html = "";
            var index = 0;

            if(alphabet == false && names.alphabet == true){
              names.reverse();
              names.alphabet = false;
            } else if(alphabet == true && names.alphabet == false){
              names.reverse();
              names.alphabet = true;
            }

            // Case-insensitive
            for (var i = 0; i <= names.length - 1; i++) {
                index = i;
                if (names[i].indexOf(searchVal) >= 0) {
                    // console.log(index);
                    $.contacts.searchList.people.push($.contacts.list.people[index]);
                }
            }

            if ($.contacts.searchList.people.length == 0) {
                $("#contact-list .bg-warning").removeClass('hide');
                console.log(alphabet);
                showContacts($.contacts.list.people);
            } else {
                $("#contact-list .bg-warning").addClass('hide');

                showContacts($.contacts.searchList.people);
            }
        })
    }

    /**
     * Sort an array alphabetly
     * @param
     * @return
     */
    $(".sort").on("click", function() {
        if ($(this).find("span").hasClass('glyphicon-sort-by-alphabet')) {
            $(this).find('span').removeClass('glyphicon-sort-by-alphabet').addClass('glyphicon-sort-by-alphabet-alt');
            alphabet = false;
        } else {
            $(this).find('span').removeClass('glyphicon-sort-by-alphabet-alt').addClass('glyphicon-sort-by-alphabet');
            alphabet = true;
        }
        if ($.contacts.searchList.people.length == 0) {
          // contacts need to be sorted in any circumstance when alphabet changed
            showContacts($.contacts.list.people);
        } else {
            $.contacts.list.people.sort(bykey("name"));
            showContacts($.contacts.searchList.people);
        }
    })

})($);


$.contacts.getContacts({
    url: 'http://jsonplaceholder.typicode.com/users',
    input: '#search-input',
    output: '#search-res',
});