const Ticket = {
  ticketList: {
    ticketsCount: 0,
    routeId: "",
    cityTo: "",
    cityFrom: "",
    ticketId: "",
    ticketDate: "",
    ticketDateReturn: "",
    priceChild: "",
    priceParent: "",
    priceChildRound: "",
    priceParentRound: "",
    freeSeat: 14,
    isRound: false
  },

  ticketTemplate: ` 
        <div class="ticket__info ticket__id_{{id}} clearfix" data-id="{{id}}">
        <div class="ticket__form-title ticket__form-title_color">
        <div class="ticket__form-number"><span class="ticket__icomoon-ticket-user"></span><span class="ticket__form-number-inner">Билет:</span></div>
        <div class="ticket__form-price"><span class="ticket__form-type" data-type="0">Взрослый: </span>
        <span class="ticket__form-price-value">{{parentPrice}}</span> руб</div>
        <div class="ticket__form-button">
        <button class="button ticket__button-del">Удалить</button>
        </div>
        </div>
        <div class="ticket__input">
        <div class="ticket__surname">
        <input type="text" class="ticket__cl-surname ticket__input-col" placeholder="Фамилия">
        </div>
        <div class="ticket__name">
        <input type="text" class="ticket__cl-name ticket__input-col" placeholder="Имя">
        </div>
        <div class="ticket__patronymic">
        <input type="text" class="ticket__cl-patronymic ticket__input-col" placeholder="Отчество">
        </div>
        <div class="ticket__gender">
        <select type="text" class="ticket__cl-gender ticket__input-col">
        <option disabled selected>Пол</option>
        <option value="male">Мужской</option>
        <option value="female">Женский</option>
        </select>
        </div>
        <div class="ticket__birthdate">
        <input type="text" class="ticket__cl-birthdate ticket__input-col" placeholder="Дата рождения">
        </div>
        <div class="ticket__phone">
        <input type="text" class="ticket__cl-phone ticket__input-col" placeholder="Телефон">
        </div>
        <div class="ticket__document">
        <select type="text" class="ticket__cl-document ticket__input-col">
        <option disabled selected>Документ</option>
        <option value="passport">Паспорт</option>
        <option value="driver_doc">Водительское удостоверение</option>
        <option value="bith_doc">Свидетельство о рождении</option>
        </select>
        </div>
        <div class="ticket__document-serial">
        <input type="text" class="ticket__cl-document-serial ticket__input-col" placeholder="Серия/номер">
        </div>
        </div>
        </div>`,

  selectRoute: function(value) {
    if (value == 0) {
      return;
    }
    $.ajax({
      type: "POST",
      url: "ajax/ticket.php",
      // url: "assets/templates/saturn/ticket/ajax/ticket.php",
      dataType: "json",
      data: {
        action: "selectRoute",
        route: value
      },
      error: function() {
        alert("При выполнении запроса произошла ошибка");
      },
      success: function(data) {
        Ticket.fillRoute(data);
      }
    });
  },

  fillRoute: function(data) {
    $(".ticket__cities-from, .ticket__cities-to")
      .find("option:not(:first)")
      .remove()
      .end()
      .prop("disabled", true);
    $(".ticket__input-date-return, .ticket__input-date-depart")
      .val("")
      .removeClass("ticket__input-date_disabled");
    $(".ticket__input-date-return")
      .datepicker()
      .data("datepicker")
      .clear();
    $(".ticket__input-date-depart")
      .datepicker()
      .data("datepicker")
      .clear();
    Ticket.trip = data;
    Ticket.ticketList.priceParent = Ticket.trip.PRICE_PARENT[0];
    Ticket.ticketList.priceChild = Ticket.trip.PRICE_CHILD[0];
    Ticket.ticketList.priceParentRound = Ticket.trip.PRICE_PARENT[1];
    Ticket.ticketList.priceChildRound = Ticket.trip.PRICE_CHILD[1];

    $.each(Ticket.trip.CITIES_FROM, function(i, val) {
      $(".ticket__cities-from").append(
        '<option value="' + val["loc_id"] + '">' + val["city"] + "</option>"
      );
    });
    $.each(Ticket.trip.CITIES_TO, function(i, val) {
      $(".ticket__cities-to").append(
        '<option value="' + val["loc_id"] + '">' + val["city"] + "</option>"
      );
    });
    $(".ticket__order-price_child").html(Ticket.trip.DATES[0]);
    $(".ticket__order-price_parent").html(Ticket.trip.DATES[0]);

    $(".ticket__cities-from, .ticket__cities-to").prop("disabled", false);
    $(
      ".ticket__cities-from option:first, .ticket__cities-to option:first"
    ).prop({
      disabled: true,
      selected: true
    });

    $(".ticket__cities-from").selectmenu("refresh");
    $(".ticket__cities-to").selectmenu("refresh");
    $(".ticket__input-date-return, .ticket__input-date-depart").addClass(
      "datepicker-here"
    );
    $(".ticket__input-date-depart, .ticket__input-date-return").datepicker({
      minDate: new Date(),
      maxDate: new Date(2019, 8, 30),
      offset: -44,
      // showOtherMonths: false,
      selectOtherMonhs: false,
      showOtherYears: false,
      toggleSelected: false,
      autoClose: true
    });
    $(".ticket__input-date-depart").datepicker({
      onRenderCell: function(date, cellType) {
        let month = date.getMonth();
        let currentDate = date.getDate();
        if (month == 8 && Ticket.trip) {
          if (
            cellType == "day" &&
            Ticket.trip.DATES[3].indexOf(currentDate) == -1
          ) {
            return {
              disabled: true,
              html:
                currentDate + '<span class="dp-note dp-note_red">закрыт</span>'
            };
          }
        }
      },
      onSelect(formDate, date) {
        Ticket.ticketList.fullDate = date;
        Ticket.ticketList.ticketDate = formDate;
        $(".ticket__input-date-depart").trigger("datechange");
      }
    });
    $(".ticket__input-date-return").datepicker({
      clearButton: true,
      onRenderCell: function(date, cellType) {
        let month = date.getMonth();
        let currentDate = date.getDate();
        if (month == 8 && Ticket.trip) {
          if (
            cellType == "day" &&
            Ticket.trip.DATES[3].indexOf(currentDate) == -1
          ) {
            return {
              disabled: true,
              html:
                currentDate + '<span class="dp-note dp-note_red">закрыт</span>'
            };
          }
        }
      },
      onSelect(formDate, date) {
        Ticket.ticketList.fullDateReturn = date;
        Ticket.ticketList.ticketDateReturn = formDate;
        $(".ticket__input-date-return").trigger("datechange");
      }
    });

    $(".ticket__button-free-seat-count").html(Ticket.ticketList.freeSeat);
    $(".ticket__order-list-seat-value").html(Ticket.ticketList.freeSeat);
    $(".ticket__order-list-select-value").html(Ticket.ticketList.ticketsCount);
    Ticket.changePrice();
  },

  addTicket: function() {
    if (Ticket.ticketList.freeSeat == Ticket.ticketList.ticketsCount) return;
    Ticket.ticketList.ticketsCount++;
    Ticket.calcTicket();
    let id = new Date().getTime();
    let ticketId = "ticket__id_" + id;
    let parentPrice = 0;
    // let route = $('.ticket__cities-subways :selected').text();
    Ticket.ticketList.isRound
      ? (parentPrice = Ticket.ticketList.priceParentRound)
      : (parentPrice = Ticket.ticketList.priceParent);

    let template = $.trim(Ticket.ticketTemplate)
      .replace(/{{id}}/gi, id)
      // .replace(/{{route}}/ig, route)
      .replace(/{{parentPrice}}/gi, parentPrice);
    $(template)
      .insertBefore(".ticket__button-add")
      .attr("data-id", id);

    Ticket.deleteButtonEvent(ticketId);
    Ticket.radioChangeEvent(ticketId);
    $(".ticket__cl-document").selectmenu({
      width: 316,
      classes: {
        "ui-selectmenu-button": "ticket__info_ui-selectmenu-button",
        "ui-selectmenu-text": "ticket__info_ui-selectmenu-text"
      },
      change: function(el, ui) {}
    });
    $(".ticket__cl-gender").selectmenu({
      width: 120,
      classes: {
        "ui-selectmenu-button": "ticket__info_ui-selectmenu-button",
        "ui-selectmenu-text": "ticket__info_ui-selectmenu-text"
      },
      change: function(el, ui) {}
    });

    $("." + ticketId + " .ticket__cl-surname").on(
      "keyup",
      { self: this },
      function() {
        return Ticket.checkText(this);
      }
    );
    $("." + ticketId + " .ticket__cl-name").on(
      "keyup",
      { self: this },
      function() {
        return Ticket.checkText(this);
      }
    );
    $("." + ticketId + " .ticket__cl-patronymic").on(
      "keyup",
      { self: this },
      function() {
        return Ticket.checkText(this);
      }
    );
    $("." + ticketId + " .ticket__cl-phone")
      .mask("(999)999-99-99")
      .on("keyup", { self: this }, function() {
        return Ticket.checkPhone(this);
      });
    $("." + ticketId)
      .find(".ticket__cl-document-serial")
      .mask("99 99 999999")
      .on("keyup", { self: this }, function() {
        return Ticket.checkDoc(this);
      });
    $("." + ticketId)
      .find(".ticket__cl-birthdate")
      .mask("99.99.9999")
      .on("keyup", { self: this }, function() {
        return Ticket.checkBirthdate(this, ticketId);
      });
    $(".ticket__cl-document").on("selectmenuchange", function() {
      $(this)
        .next()
        .removeClass("ticket__info_ui-selectmenu-button_red")
        .addClass("ticket__info_ui-selectmenu-button_green");
      let val = $(this).val();
      let input = $("." + ticketId).find(".ticket__cl-document-serial");
      Ticket.fillMaskDoc(val, input);
    });
    $(".ticket__cl-gender").on("selectmenuchange", function() {
      $(this)
        .next()
        .removeClass("ticket__info_ui-selectmenu-button_red")
        .addClass("ticket__info_ui-selectmenu-button_green");
    });
    Ticket.changePrice();
  },

  calcTicket: function() {
    const order = ".ticket__order-list";
    $(order + "-select-value").html(Ticket.ticketList.ticketsCount);

    let ticketFree =
      Ticket.ticketList.freeSeat - Ticket.ticketList.ticketsCount;

    if (ticketFree < 0) {
      $(".ticket__button-buy").prop("disabled", true);
    } else {
      $(".ticket__button-buy").prop("disabled", false);
      $(".ticket__button-free-seat-count").html(ticketFree);
    }

    if (
      Ticket.ticketList.freeSeat > 0 &&
      Ticket.ticketList.ticketsCount <= Ticket.ticketList.freeSeat
    ) {
    }
  },

  deleteTicket: function(el) {
    let $ticket = $(el).closest(".ticket__info");
    Ticket.ticketList.ticketsCount--;
    Ticket.calcTicket();
    $ticket.remove();
    Ticket.changePrice();
  },

  radioChangeEvent: function(el) {
    $("." + el).on("change", function() {
      let value = $(this)
        .find(".ticket__radio-box:checked")
        .val();
      if (value == "0")
        $(this)
          .find(".ticket__form-price-value")
          .text(Ticket.ticketList.priceParent[+value]);
      if (value == "1")
        $(this)
          .find(".ticket__form-price-value")
          .text(Ticket.ticketList.priceParent[+value]);
    });
  },

  deleteButtonEvent: function(el) {
    $("." + el + " .ticket__button-del").on("click", function() {
      Ticket.deleteTicket(this);
    });
  },

  upFirst: function(str) {
    str = str.charAt(0).toUpperCase() + str.substr(1);
    return str;
  },

  fillMaskDoc: function(val, input) {
    input.removeClass("ticket__input_success");
    switch (val) {
      case "passport":
        input.mask("99 99 999999");
        break;
      default:
        input.unmask().val("");
    }
  },

  checkSelectDate: function() {
    let d_s = Date.parse(Ticket.ticketList.fullDate);
    let d_r = Date.parse(Ticket.ticketList.fullDateReturn);
    if (d_s >= d_r) {
      return true;
    }
    $(".ticket__box-error-head").text("");
    $(".ticket__input-date-depart").removeClass("ticket__input_error_bold");
    return false;
  },

  checkText: function(el) {
    const err = "ticket__input_error";
    const ok = "ticket__input_success";
    let value = $(el).val();
    let reg = /^([А-Яа-яa-zA-z]|)([A-za-zА-Яа-я \-;',./]*)$/g;
    if (value.length > 0) {
      value = this.replaceEnToRu(value);
      if (reg.test(value)) {
        $(el)
          .removeClass(err)
          .addClass(ok);
        $(el).val(this.upFirst(value));
      } else {
        check(el, "TEXT_ERROR");
      }
    }
  },

  checkDoc: function(el) {
    const err = "ticket__input_error";
    const ok = "ticket__input_success";
    let value = $(el).val();
    if (value.indexOf("_") == -1) {
      $(el)
        .removeClass(err)
        .addClass(ok);
    } else {
      check(el, "TEXT_ERROR");
    }
  },

  checkPhone: function(el) {
    const err = "ticket__input_error";
    const ok = "ticket__input_success";
    let value = $(el).val();
    if (value == "") {
      $(el).mask("(999)999-99-99");
    }
    if (value.indexOf("_") == -1) {
      $(el)
        .removeClass(err)
        .addClass(ok);
    } else {
      $(el)
        .removeClass(ok)
        .addClass(err);
    }
  },

  checkBirthdate: function(el, ticketId) {
    const err = "ticket__input_error";
    const ok = "ticket__input_success";
    let value = $(el).val();
    if (value == "") {
      $(el).mask("99.99.9999");
    }
    if (value.indexOf("_") == -1) {
      let match = /([0-2]\d|3[01])\.(0\d|1[012])\.(\d{4})/.test(value);

      if (!match) {
        $(el)
          .removeClass(ok)
          .addClass(err);
      } else {
        let current = value.split(".");
        let birth = new Date(current[2], current[1] - 1, current[0]);
        if (current[2] < 1800 || current[1] == 0 || current[0] == 0) {
          $(el)
            .removeClass(ok)
            .addClass(err);
        } else {
          $(el)
            .removeClass(err)
            .addClass(ok);

          let today = new Date();
          let years = today.getFullYear() - birth.getFullYear();
          birth.setFullYear(today.getFullYear());
          if (today < birth) {
            years--;
          }

          if ((years >= 0) & (years < 14)) {
            if (!Ticket.ticketList.isRound) {
              $("." + ticketId + " .ticket__form-price-value").text(
                Ticket.ticketList.priceChild
              );
            } else
              $("." + ticketId + " .ticket__form-price-value").text(
                Ticket.ticketList.priceChildRound
              );
            $("." + ticketId + " .ticket__form-type")
              .text("Детский: ")
              .attr("data-type", 1);
            Ticket.changePrice();
          } else if ((years >= 14) & (years <= 120)) {
            if (!Ticket.ticketList.isRound)
              $("." + ticketId + " .ticket__form-price-value").text(
                Ticket.ticketList.priceParent
              );
            else
              $("." + ticketId + " .ticket__form-price-value").text(
                Ticket.ticketList.priceParentRound
              );
            $("." + ticketId + " .ticket__form-type")
              .text("Взрослый: ")
              .attr("data-type", 0);
            Ticket.changePrice();
          } else {
            $(el)
              .removeClass(ok)
              .addClass(err);
          }
        }
      }
    }
  },

  replaceEnToRu: function(str) {
    let replacer = {
      q: "й",
      w: "ц",
      e: "у",
      r: "к",
      t: "е",
      y: "н",
      u: "г",
      i: "ш",
      o: "щ",
      p: "з",
      "[": "х",
      "]": "ъ",
      a: "ф",
      s: "ы",
      d: "в",
      f: "а",
      g: "п",
      h: "р",
      j: "о",
      k: "л",
      l: "д",
      ";": "ж",
      "'": "э",
      z: "я",
      x: "ч",
      c: "с",
      v: "м",
      b: "и",
      n: "т",
      m: "ь",
      ",": "б",
      ".": "ю",
      "/": ".",
      "\\": ""
    };
    for (let i = 0; i < str.length; i++) {
      if (replacer[str[i].toLowerCase()] != undefined) {
        if (str[i] == str[i].toLowerCase()) {
          replace = replacer[str[i].toLowerCase()];
        } else if (str[i] == str[i].toUpperCase()) {
          replace = replacer[str[i].toLowerCase()].toUpperCase();
        }
        str = str.replace(str[i], replace);
      }
    }
    return str;
  },

  changePrice: function() {
    const order = ".ticket__order-list";
    let total = 0;
    let ticket = Ticket.ticketList;
    if (ticket.ticketDate && ticket.ticketDateReturn) {
      ticket.isRound = true;
      $(order + "-direction-text").text("Туда и обратно: ");
      $(order + "-child-price").html(Ticket.numFormat(ticket.priceChildRound));
      $(order + "-parent-price").html(
        Ticket.numFormat(ticket.priceParentRound)
      );
    } else {
      ticket.isRound = false;
      $(order + "-direction-text").text("В одну сторону: ");
      $(order + "-child-price").html(Ticket.numFormat(ticket.priceChild));
      $(order + "-parent-price").html(Ticket.numFormat(ticket.priceParent));
    }
    if (ticket.ticketsCount > 0) {
      $(".ticket")
        .find(".ticket__form-type")
        .each(function(i, el) {
          let value = $(el).attr("data-type");
          switch (value) {
            case "0":
              if (ticket.isRound) {
                $(el)
                  .siblings(".ticket__form-price-value")
                  .html(ticket.priceParentRound);
              } else {
                $(el)
                  .siblings(".ticket__form-price-value")
                  .html(ticket.priceParent);
              }
              break;
            case "1":
              if (ticket.isRound) {
                $(el)
                  .siblings(".ticket__form-price-value")
                  .html(ticket.priceChildRound);
              } else {
                $(el)
                  .siblings(".ticket__form-price-value")
                  .html(ticket.priceChild);
              }
              break;
            default:
              break;
          }
          total += parseInt(
            $(el)
              .siblings(".ticket__form-price-value")
              .html()
          );
        });
    } else {
      $(".ticket__order-list").hide();
    }

    // var options = { style: 'currency', currency: 'RUB' };
    // var numberFormat = new Intl.NumberFormat('ru-RU', options);
    // $('.ticket').find('.ticket__footer-amount-value').html(numberFormat.format(total));
    $(".ticket")
      .find(".ticket__footer-amount-value")
      .html(Ticket.numFormat(total));
  },

  numFormat: function(n) {
    n += "";
    n = new Array(4 - (n.length % 3)).join("U") + n;
    return n.replace(/([0-9U]{3})/g, "$1 ").replace(/U/g, "");
  }
};
//-----------------------------------------------------------------------------------------------------------------------
function check(el, text, type = 0) {
  const err = "ticket__input_error";
  const ok = "ticket__input_success";
  switch (type) {
    case 0:
      $(el)
        .removeClass(ok)
        .addClass(err);
      break;
    case 1:
      $(el).addClass("ticket__input_error_bold");
      $(".ticket")
        .find(".ticket__box-error-head")
        .text(text);
      $(el).on("click", function() {
        $(el).removeClass("ticket__input_error_bold");
        $(".ticket")
          .find(".ticket__box-error-head")
          .text("");
      });
      break;
    case 2:
      $(".ticket")
        .find(".ticket__box-error-footer")
        .text("Данные билета не заполнены");
      for (let key in el) {
        $(el[key])
          .removeClass(ok)
          .addClass(err);
      }
      break;
    case 3:
      $(".ticket")
        .find(".ticket__box-error-footer")
        .text("Данные билета не заполнены");
      for (let key in el) {
        $(el[key])
          .find(".ticket__info_ui-selectmenu-button")
          .addClass("ticket__info_ui-selectmenu-button_red");
      }
      break;
    case 4:
      $(el).addClass(err);
      $(".ticket")
        .find(".ticket__box-error-footer")
        .text(text);
      $(el).on("click", function() {
        $(el).removeClass(err);
        $(".ticket")
          .find(".ticket__box-error-footer")
          .text("");
      });
      break;
    default:
      return false;
  }
}
//-----------------------------------------------------------------------------------------------------------------------
$(function() {
  $(".ticket__cities-subways").selectmenu({
    width: 640,
    classes: {
      "ui-selectmenu-button": "ticket__choose_ui-selectmenu-button",
      "ui-selectmenu-text": "ticket__info_ui-selectmenu-text_bold"
    },
    change: function(e) {
      $(".ticket__order-list").hide();
      let val = $(this).val();
      Ticket.ticketList.routeId = val;
      Ticket.selectRoute(val);
      Ticket.ticketList.cityFrom = null;
      Ticket.ticketList.cityTo = null;
      Ticket.ticketList.ticketDate = null;
      Ticket.ticketList.ticketDateReturn = null;
      $(".ticket__box-error-head").text("");
      $(".ticket__button-del").each(function(i, el) {
        Ticket.deleteTicket(el);
      });
    }
  });
  $(".ticket__cities-from").selectmenu({
    width: 317,
    classes: {
      "ui-selectmenu-button": "ticket__choose_ui-selectmenu-button"
    },
    change: function(e) {
      Ticket.ticketList.cityFrom = $(this).val();
    }
  });
  $(".ticket__cities-to").selectmenu({
    width: 317,
    classes: {
      "ui-selectmenu-button": "ticket__choose_ui-selectmenu-button"
    },
    change: function(e) {
      Ticket.ticketList.cityTo = $(this).val();
    }
  });
  $(".ticket__input-date-depart").on("datechange", function() {
    if (Ticket.checkSelectDate())
      check(this, "Дата отправления должна быть меньше обратной даты", 1);
    Ticket.changePrice();
  });
  $(".ticket__input-date-return").on("datechange", function() {
    if (Ticket.checkSelectDate())
      check(this, "Обратная дата должна быть больше даты отправления", 1);
    else if (Ticket.ticketList.ticketDate)
      $(".ticket")
        .find(".ticket__input-date-depart")
        .removeClass("ticket__input_error_bold");
    Ticket.changePrice();
  });

  $(".ticket__button-add").on("click", function() {
    const select = ".ui-selectmenu-button";

    if (
      Ticket.ticketList.routeId &&
      Ticket.ticketList.cityFrom &&
      Ticket.ticketList.cityTo &&
      Ticket.ticketList.ticketDate
    ) {
      if (Ticket.checkSelectDate()) {
        check(
          ".ticket__input-date-return",
          "Дата отправления должна быть меньше обратной даты",
          1
        );
        check(
          ".ticket__input-date-depart",
          "Дата отправления должна быть меньше обратной даты",
          1
        );
        return;
      }
      $(".ticket__order-list").show();
      Ticket.addTicket();
    } else {
      if (!Ticket.ticketList.routeId) {
        check(".ticket__select-route " + select, "Выберите маршрут", 1);
      } else {
        if (!Ticket.ticketList.cityFrom) {
          check(
            ".ticket__select-cities-from " + select,
            "Выберите место отправления",
            1
          );
        } else if (!Ticket.ticketList.cityTo) {
          check(
            ".ticket__select-cities-to " + select,
            "Выберите место назначения",
            1
          );
        } else if (!Ticket.ticketList.ticketDate) {
          check(".ticket__input-date-depart", "Выберите дату отправления", 1);
        }
      }
    }
  });

  $(".ticket__button-buy").on("click", function() {
    Ticket.data = {};
    const sel = ".ticket__";
    let isCheckAgreement = $(sel + "checkbox-agreement").prop("checked");
    let $selector = $(".ticket");
    let data = {};
    let error = "";
    let route = Ticket.ticketList;

    if (route.routeId) {
      data.route = route.routeId;
    } else {
      check(
        $(sel + "select-route .ui-selectmenu-button"),
        "Выберите маршрут",
        1
      );
      error += "ERROR_ROUTE" + "\n";
      return;
    }
    if (route.cityFrom) {
      data.cityFrom = route.cityFrom;
    } else {
      check(
        $(sel + "select-cities-from .ui-selectmenu-button"),
        "Выберите место отправления",
        1
      );
      error += "ERROR_CITIES_FROM" + "\n";
      return;
    }
    if (route.cityTo) {
      data.cityTo = route.cityTo;
    } else {
      check(
        $(sel + "select-cities-to .ui-selectmenu-button"),
        "Выберите место назначения",
        1
      );
      error += "ERROR_CITIES_TO" + "\n";
      return;
    }
    if (route.ticketDate) {
      data.date = route.ticketDate;
    } else {
      check($(sel + "input-date-depart"), "Выберите дату отправления", 1);
      error += "ERROR_CALENDAR" + "\n";
      return;
    }
    if (Ticket.checkSelectDate()) {
      check(
        ".ticket__input-date-return",
        "Дата отправления должна быть меньше обратной даты",
        1
      );
      check(
        ".ticket__input-date-depart",
        "Дата отправления должна быть меньше обратной даты",
        1
      );
      error += "ERROR_CALENDAR" + "\n";
      return;
    }
    if (Ticket.ticketList.ticketsCount == 0) {
      check($(".ticket__button-add"), "Добавьте пассажира", 4);
      error += "ERROR_NO_TICKET" + "\n";
      return;
    }
    if (route.ticketDateReturn) {
      data.dateReturn = route.ticketDateReturn;
    } else {
      data.dateReturn = "";
    }
    data.backward = route.isRound || false;

    data.tickets = {};
    data.ticketsCount = 0;

    $selector.find(sel + "info").each(function(index) {
      let dataId = $(this).attr("data-id");
      let $input = $(sel + "id_" + dataId);
      let ticket = {};

      ticket.type =
        $(this)
          .find(sel + "form-type")
          .attr("data-type") || false;
      ticket.surname = $input.find(sel + "cl-surname").val() || false;
      ticket.name = $input.find(sel + "cl-name").val() || false;
      ticket.patronymic = $input.find(sel + "cl-patronymic").val() || false;
      ticket.phone = $input.find(sel + "cl-phone").val() || false;
      ticket.gender = $input.find(sel + "cl-gender").val() || false;
      ticket.doctype = $input.find(sel + "cl-document").val() || false;
      ticket.docserial = $input.find(sel + "cl-document-serial").val() || false;
      ticket.birthdate = $input.find(sel + "cl-birthdate").val() || false;

      let check_input = [];
      let check_span = [];
      if (ticket.surname == false) {
        check_input.push($input.find(sel + "cl-surname"));
      }
      if (ticket.name == false) {
        check_input.push($input.find(sel + "cl-name"));
      }
      if (ticket.patronymic == false) {
        check_input.push($input.find(sel + "cl-patronymic"));
      }
      if (ticket.phone == false || ticket.phone.indexOf("_") !== -1) {
        check_input.push($input.find(sel + "cl-phone"));
      }
      if (!ticket.gender) {
        check_span.push($input.find(sel + "gender"));
      }
      if (!ticket.doctype) {
        check_span.push($input.find(sel + "document"));
      }
      if (ticket.docserial == false || ticket.docserial.indexOf("_") !== -1) {
        check_input.push($input.find(sel + "cl-document-serial"));
      }
      if (ticket.birthdate == false) {
        check_input.push($input.find(sel + "cl-birthdate"));
      }

      if (check_input.length != 0 || check_span.length != 0) {
        check(check_input, "Данные билета не заполнены", 2);
        check(check_span, "Данные билета не заполнены", 3);
        check($input, "Данные билета не заполнены", 4);
        error += "ERROR_EMPTY_TICKET" + "\n";
      } else {
        data.ticketsCount++;
        data.tickets[data.ticketsCount] = ticket;
      }
    });

    if (error.length) {
      return;
    }
    if (!isCheckAgreement) {
      check(
        $(sel + "footer-agreement"),
        "Необходимо Ваше согласие на обработку личных данных",
        4
      );
      error += "ERROR_AGREEMENT" + "\n";
      return;
    }
    Ticket.data = data;

    $selector
      .find(sel + "box-error-footer")
      .text("")
      .end()
      .find(sel + "box-error-head")
      .text("");

    // let temp = {
    //   tickets: {
    //     1: {
    //       type: "0",
    //       surname: "Пупкин",
    //       name: "Иван",
    //       patronymic: "Петрович",
    //       phone: "(111)111-11-77",
    //       gender: "male",
    //       doctype: "passport",
    //       docserial: "1111 777777",
    //       birthdate: "11.11.2000"
    //     },
    //     2: {
    //       type: "1",
    //       surname: "Bobinov",
    //       name: "Anton",
    //       patronymic: "Ivanovich",
    //       phone: "(111)111-11-11",
    //       gender: "female",
    //       doctype: "driver_doc",
    //       docserial: "7777 777777",
    //       birthdate: "11.11.2014"
    //     },
    //     3: {
    //       type: "0",
    //       surname: "Жужлев",
    //       name: "Иван",
    //       patronymic: "Петрович",
    //       phone: "(111)111-11-77",
    //       gender: "male",
    //       doctype: "passport",
    //       docserial: "1111 777777",
    //       birthdate: "11.11.2000"
    //     },
    //     4: {
    //       type: "1",
    //       surname: "Войнов",
    //       name: "Anton",
    //       patronymic: "Ivanovich",
    //       phone: "(111)111-11-11",
    //       gender: "female",
    //       doctype: "driver_doc",
    //       docserial: "7777 777777",
    //       birthdate: "11.11.2014"
    //     }
    //   },
    //   backward: true,
    //   route: "2",
    //   cityTo: "2",
    //   cityFrom: "1",
    //   date: "11.08.2019",
    //   dateReturn: "21.08.2019",
    //   ticketsCount: 4
    // };

    $.ajax({
      url: "ajax/ticket.php",
      // url: "assets/templates/saturn/ticket/ajax/ticket.php",
      type: "POST",
      dataType: "json",
      beforeSend: function() {
        startLoadingAnimation();
      },
      data: {
        action: "addTickets",
        info: Ticket.data
        // info: temp
      },
      error: function() {
        console.log("Error request. Cant get route datas.");
        stopLoadingAnimation();
      },
      success: function(data) {
        window.location =
          // window.location.protocol + "//" + window.location.host + "/confirm";
          window.location.protocol +
          "//" +
          window.location.host +
          "/ticket/confirm.html";
      }
    });
  });
});

function startLoadingAnimation() {
  $(".loader__animation").show();
}

function stopLoadingAnimation() {
  $(".loader__animation").hide();
}
