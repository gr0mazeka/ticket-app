const Trip = {
  tickets: {},

  init: function() {
    $.ajax({
      url: "ajax/ticket.php",
      // url: "assets/templates/saturn/ticket/ajax/ticket.php",
      type: "POST",
      data: {
        action: "getTickets"
      },
      error: function() {
        console.log("При выполнении запроса произошла ошибка");
      },
      success: function(data) {
        Trip.tickets = JSON.parse(data);
        // console.log(Trip.tickets);
        // $("body").html(data);
        // if (!$.isEmptyObject(tickets.tickets[i])) { }
        if (Trip.tickets.ticketsCount > 0) Trip.parseTicket(Trip.tickets);
        else {
          $("body")
            .find(".ticket__empty")
            .removeClass("ticket__empty_hide")
            .addClass(".ticket__empty_show");
          return;
        }
      }
    });
  },

  parseTicket: function(tickets) {
    let ticketBlock = $("<div/>").addClass("ticket");
    ticketBlock.appendTo("#order_form");
    ticketBlock.append(
      $("<div/>")
        .addClass("ticket__details")
        .append(
          $("<div/>")
            .addClass("ticket__details-info")
            .addClass("ticket__details-route")
            .text("Маршрут: ")
            .append($("<span/>").text(tickets.route))
        )
        .append(
          $("<div/>")
            .addClass("ticket__details-place")
            .append(
              $("<div/>")
                .addClass("ticket__details-info")
                .append($("<span/>").addClass("ticket__icomoon-bus"))
                .append(
                  $("<span/>")
                    .addClass("ticket__details-text")
                    .text("Место отправления: ")
                )
                .append($("<span/>").text(tickets.cityFrom))
            )
            .append(
              $("<div/>")
                .addClass("ticket__details-info")
                .append($("<span/>").addClass("ticket__icomoon-calendar-clock"))
                .append(
                  $("<span/>")
                    .addClass("ticket__details-text")
                    .text("Дата: ")
                )
                .append(
                  $("<span/>").text(tickets.date + " в " + tickets.timeFrom)
                )
            )
        )
        .append(
          tickets.backward
            ? $("<div/>")
                .addClass("ticket__details-place")
                .append(
                  $("<div/>")
                    .addClass("ticket__details-info")
                    .append($("<span/>").addClass("ticket__icomoon-bus"))
                    .append(
                      $("<span/>")
                        .addClass("ticket__details-text")
                        .text("Место отправления: ")
                    )
                    .append($("<span/>").text(tickets.cityTo))
                )
                .append(
                  $("<div/>")
                    .addClass("ticket__details-info")
                    .append(
                      $("<span/>").addClass("ticket__icomoon-calendar-clock")
                    )
                    .append(
                      $("<span/>")
                        .addClass("ticket__details-text")
                        .text("Дата: ")
                    )
                    .append(
                      $("<span/>").text(
                        tickets.dateReturn + " в " + tickets.timeReturn
                      )
                    )
                )
            : null
        )
    );
    $.each(tickets.tickets, function(i, val) {
      let id = tickets.tickets[i].id;
      let ticketId = "ticket__id_" + id;
      let type = "";
      tickets.tickets[i].type == "0" ? (type = "Взрослый") : (type = "Детский");
      let template = $.trim(Trip.ticketTemplate)
        .replace(/{{id}}/gi, id)
        .replace(/{{num}}/gi, i)
        .replace(/{{type}}/gi, type)
        .replace(/{{price}}/gi, tickets.tickets[i].price)
        .replace(/{{surname}}/gi, tickets.tickets[i].surname)
        .replace(/{{name}}/gi, tickets.tickets[i].name)
        .replace(/{{patronymic}}/gi, tickets.tickets[i].patronymic)
        .replace(/{{phone}}/gi, tickets.tickets[i].phone)
        .replace(/{{birthdate}}/gi, tickets.tickets[i].birthdate)
        .replace(/{{serial}}/gi, tickets.tickets[i].docserial);

      ticketBlock.append(template);

      $(
        ".ticket__id_" +
          id +
          " .ticket__cl-document option[value='" +
          tickets.tickets[i].doctype +
          "']"
      ).prop("selected", true);
      $(
        ".ticket__id_" +
          id +
          " .ticket__cl-gender option[value='" +
          tickets.tickets[i].gender +
          "']"
      ).prop("selected", true);
      $(".ticket option:not(':selected')").remove();
      Trip.deleteButtonEvent(ticketId);
    });
    ticketBlock
      .append(
        $("<div/>")
          .addClass("ticket__payment-total")
          .append($("<span/>").text("Общая стоимость: "))
          .append(
            $("<span/>")
              .addClass("ticket__payment-total-value")
              .text("---")
          )
          .append($("<span/>").text("руб."))
      )
      .append(
        $("<div/>")
          .addClass("ticket__footer-agreement")
          .append(
            $("<label/>")
              .addClass("ticket__checkbox")
              .append(
                $("<input/>")
                  .addClass("ticket__checkbox-agreement")
                  .attr({ type: "checkbox" })
              )
              .append(
                $("<span/>")
                  .addClass("ticket__checkbox-agreement-text")
                  .text("Я ознакомлен с офертой")
              )
          )
      )
      .append(
        $("<div/>").append(
          $("<button/>")
            .addClass("button")
            .addClass("button_size_l")
            .addClass("button_theme_orange")
            .addClass("button__text")
            .addClass("ticket__button-payment")
            .attr({ type: "submit" })
            .text("Оплатить")
        )
      );

    $(".ticket input, .ticket select")
      .attr("readonly", "readonly")
      .addClass("ticket__input-col_readonly");
    $(".ticket")
      .find(".ticket__checkbox-agreement")
      .on("click", function() {
        $(".ticket")
          .find(".ticket__footer-agreement")
          .removeClass("ticket__input_error");
      });
    $(".ticket__page-pay-info").show();
    Trip.submitButtonEvent();
    Trip.calcTrip(tickets.sum, tickets.ticketsCount);
  },

  submitButtonEvent: function() {
    $("#order_form").submit(function(e) {
      e.preventDefault();
      let isCheckAgreement = $(".ticket__checkbox-agreement").prop("checked");
      if (!isCheckAgreement) {
        $(".ticket__footer-agreement").addClass("ticket__input_error");
        return;
      } else {
        $(".ticket__footer-agreement").removeClass("ticket__input_error");
        const form = $("#order_form");
        let message = form.serialize();
        $.ajax({
          type: "POST",
          url: "ajax/ticket.php",
          // url: "assets/templates/saturn/ticket/ajax/ticket.php",
          beforeSend: function() {
            startLoadingAnimation();
          },
          data: {
            action: "confirm",
            info: message
          },
          error: function() {
            stopLoadingAnimation();
            alert("Ошибка отправки данных");
          },
          success: function(data) {
            // let tmp = JSON.parse(data);
            // console.log(data);
            // stopLoadingAnimation();
            window.location = data;
            // $("#order_form").html("");
            // $("body")
            //   .find(".ticket__empty")
            //   .removeClass("ticket__empty_hide")
            //   .addClass(".ticket__empty_show")
            //   .css({ color: "green", "font-weight": "bold" })
            //   .text("Заказ отправлен");

            // alert("send");
          }
        });
      }
    });
  },

  deleteButtonEvent: function(el) {
    $("." + el + " .ticket__button-del").on("click", function(e) {
      e.preventDefault();
      // e.stopImmediatePropagation();
      Trip.deleteTicket(this);
    });
  },

  deleteTicket: function(el) {
    let $ticket = $(el).closest(".ticket__info");
    let id = $(el)
      .closest(".ticket__info")
      .attr("data-id");
    Trip.removeFromBasket(id);
    $ticket.remove();
  },

  removeFromBasket: function(id) {
    $.ajax({
      url: "ajax/ticket.php",
      // url: "assets/templates/saturn/ticket/ajax/ticket.php",
      type: "POST",
      dataType: "json",
      beforeSend: function() {
        startLoadingAnimation();
      },
      data: {
        action: "removeTicket",
        id: id
      },
      error: function(err) {
        console.log("error");
      },
      success: function(data) {
        if (data["success"]) {
          Trip.calcTrip(data["sum"], data["cnt"]);
        }
        stopLoadingAnimation();
      }
    });
  },

  calcTrip: function(val, cnt) {
    Trip.tickets.ticketsCount = cnt;
    // console.log(cnt);
    if (cnt) {
      $(".ticket")
        .find(".ticket__payment-total-value")
        .text(this.numFormat(val));
    } else {
      $("#order_form").html("");
      $("body")
        .find(".ticket__empty")
        .removeClass("ticket__empty_hide")
        .addClass(".ticket__empty_show");
      $(".ticket__page-pay-info").hide();
    }
  },

  numFormat: function(n) {
    n += "";
    n = new Array(4 - (n.length % 3)).join("U") + n;
    return n.replace(/([0-9U]{3})/g, "$1 ").replace(/U/g, "");
  },

  ticketTemplate: `<div class="ticket__info ticket__id_{{id}} clearfix" data-id="{{id}}">
            <div class="ticket__form-title ticket__form-title_color">
                <div class="ticket__form-number"><span class="ticket__icomoon-ticket-user"></span><span class="ticket__form-number-inner">Билет №{{num}}</span></div>
                <div class="ticket__form-price"><span class="ticket__form-type">{{type}}: </span>
                    <span class="ticket__form-price-value">{{price}}</span> руб</div>
                <div class="ticket__form-button">
                    <button class="button ticket__button-del">Удалить</button>
                </div>
            </div>
            <div class="ticket__input">
                <div class="ticket__surname">
                    <input type="text" name="surname" class="ticket__cl-surname ticket__input-col" placeholder="Фамилия" value="{{surname}}">
                </div>
                <div class="ticket__name">
                    <input type="text" name="name" class="ticket__cl-name ticket__input-col" placeholder="Имя" value="{{name}}">
                </div>
                <div class="ticket__patronymic">
                    <input type="text" name="patronymic" class="ticket__cl-patronymic ticket__input-col" placeholder="Отчество" value="{{patronymic}}">
                </div>
                <div class="ticket__gender">
                    <select type="text" name="gender" class="ticket__cl-gender ticket__input-col">
                        <option disabled>Пол</option>
                        <option value="male" disabled>Мужской</option>
                        <option value="female" disabled>Женский</option>
                    </select>
                </div>
                <div class="ticket__birthdate">
                    <input type="text" class="ticket__cl-birthdate ticket__input-col" placeholder="Дата рождения" value="{{birthdate}}">
                </div>
                <div class="ticket__phone">
                    <input type="text" class="ticket__cl-phone ticket__input-col" placeholder="Телефон" value="{{phone}}">
                </div>
                <div class="ticket__document">
                    <select type="text" class="ticket__cl-document ticket__input-col">
                        <option disabled>Документ</option>
                        <option value="passport">Паспорт</option>
                        <option value="driver_doc">Водительское удостоверение</option>
                        <option value="bith_doc">Свидетельство о рождении</option>
                    </select>
                </div>
                <div class="ticket__document-serial">
                    <input type="text" class="ticket__cl-document-serial ticket__input-col" placeholder="Серия/номер" value="{{serial}}">
                </div>
            </div>
        </div>`
};

$(function() {
  Trip.init();
});

function startLoadingAnimation() {
  $(".loader__animation").show();
}

function stopLoadingAnimation() {
  $(".loader__animation").hide();
}
