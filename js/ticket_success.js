const Revise = {
  init: function() {
    $.ajax({
      url: "ajax/ticket.php",
      // url: "assets/templates/saturn/ticket/ajax/ticket.php",
      type: "POST",
      dataType: "json",
      beforeSend: function() {
        startLoadingAnimation();
      },
      data: {
        action: "checkOrder"
      },
      error: function() {
        console.log("error");
        // window.location =
        // window.location.protocol + "//" + window.location.host + "/ticket/";
      },
      success: function(data) {
        console.log(data);
        if (+data == 2) {
          $("body")
            .find(".ticket__success")
            .addClass(".ticket__empty_show")
            .css({
              "text-align": "center"
            })
            .html(
              "<p style='color:green;'><b>Спасибо за покупку!</b></p>" +
                "<p>Заказ передан в обработку.</p>" +
                "<p>С Вами свяжутся в ближайшее время.</p>" +
                "<p style='margin-top:50px;'>Дополнительная информация по телефону: 8(962)019-84-84</p>"
            );
          stopLoadingAnimation();
        } else {
          $("body")
            .find(".ticket__success")
            .css({ color: "red", "font-weight": "bold" })
            .text("Error.");
          stopLoadingAnimation();
          //   window.location =
          //     window.location.protocol + "//" + window.location.host + "/ticket/";
        }
      }
    });
  }
};

function startLoadingAnimation() {
  $(".loader__animation").show();
}

function stopLoadingAnimation() {
  $(".loader__animation").hide();
}

$(function() {
  Revise.init();
});
