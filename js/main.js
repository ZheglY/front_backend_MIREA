// Получаем модальное окно по id.
const orderDialog = document.getElementById('order-dialog');

// Получаем кнопки заказа и открытия общей формы обратной связи.
const orderButtons = document.querySelectorAll('.product-card__button, .order-dialog-trigger');

// Получаем кнопку закрытия модального окна.
const closeDialogButton = document.getElementById('close-order-dialog');

// Получаем скрытое поле, в которое будет записан выбранный товар.
const selectedProductInput = document.getElementById('selected-product');

// Перебираем все кнопки «Заказать».
orderButtons.forEach((button) => {
  button.addEventListener('click', () => {
    // Получаем название товара из data-атрибута.
    const productName = button.dataset.product;

    // Записываем название товара в скрытое поле формы.
    selectedProductInput.value = productName;

    // Скрываем сообщение от предыдущей заявки.
    successMessage.hidden = true;

    // Открываем модальное окно.
    orderDialog.showModal();
  });
});

// Закрываем модальное окно по кнопке «Закрыть».
closeDialogButton.addEventListener('click', () => {
  orderDialog.close();
});

// Получаем форму заявки.
const orderForm = document.getElementById('order-form');

// Получаем сообщение об успешной отправке.
const successMessage = document.getElementById('success-message');

// Обрабатываем отправку формы.
orderForm.addEventListener('submit', (event) => {
  // Отменяем стандартную отправку формы,
  // потому что backend пока не подключён.
  event.preventDefault();

  // Сбрасываем предыдущие признаки ошибок.
  const formElements = Array.from(orderForm.elements);

  formElements.forEach((element) => {
    if (element.willValidate) {
      element.removeAttribute('aria-invalid');
    }
  });

  // Проверяем встроенные HTML-ограничения формы.
  if (!orderForm.checkValidity()) {
    formElements.forEach((element) => {
      if (element.willValidate && !element.checkValidity()) {
        element.setAttribute('aria-invalid', 'true');
      }
    });

    // Показываем стандартные сообщения браузера.
    orderForm.reportValidity();
    return;
  }

  // Показываем сообщение об успешной отправке.
  successMessage.hidden = false;

  // Очищаем форму.
  orderForm.reset();
  // У hidden-поля value одновременно меняет исходное значение для reset().
  selectedProductInput.value = '';

  // Закрываем модальное окно.
  orderDialog.close();
});

// ==========================================================================
// Обработка формы на странице order.html
// ==========================================================================

const orderPageForm = document.getElementById('order-page-form');
const orderPageSuccessMessage = document.getElementById('order-page-success');

if (orderPageForm) {
    orderPageForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Отменяем стандартную отправку

        // Сбрасываем предыдущие признаки ошибок
        const formElements = Array.from(orderPageForm.elements);
        formElements.forEach((element) => {
            if (element.willValidate) {
                element.removeAttribute('aria-invalid');
            }
        });

        // Проверяем встроенные HTML-ограничения формы
        if (!orderPageForm.checkValidity()) {
            formElements.forEach((element) => {
                if (element.willValidate && !element.checkValidity()) {
                    element.setAttribute('aria-invalid', 'true');
                }
            });
            orderPageForm.reportValidity(); // Показываем стандартные сообщения браузера
            return;
        }

        // Показываем сообщение об успешной отправке
        orderPageSuccessMessage.hidden = false;
        // Очищаем форму
        orderPageForm.reset();
    });
}

// ==========================================================================
// Кнопка "Наверх" (Fixed позиционирование)
// ==========================================================================

const scrollToTopButton = document.createElement('button');
scrollToTopButton.textContent = '↑';
scrollToTopButton.className = 'scroll-to-top';
scrollToTopButton.setAttribute('aria-label', 'Наверх');
document.body.appendChild(scrollToTopButton);

scrollToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Скрываем кнопку, если страница не прокручена
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollToTopButton.style.display = 'block';
    } else {
        scrollToTopButton.style.display = 'none';
    }
});

// Изначально скрываем кнопку
scrollToTopButton.style.display = 'none';