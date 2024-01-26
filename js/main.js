Vue.component('kanban-card', { //Представляет карточку на доске канбана
    props: ['card', 'columnIndex', 'cardIndex'], //Для получения данных от родительского компонента
    template: `
        <div class="card"
            :class="{ 'completed-on-time': card.status === 'Completed on time', 'overdue': card.status === 'Overdue' }">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-date">Создано: {{ card.dateCreated }}</div>
            <div class="card-date">Последнее изменение: {{ card.lastEdited }}</div>
            <div class="card-description">{{ card.description }}</div>
            <div class="card-deadline" v-if="card.deadline">Deadline: {{ card.deadline }}</div>
            <div class="card-status" v-if="card.status">Статус: {{ card.status }}</div>
            <div class="card-repeat-reason" v-if="card.repeatReason !== undefined">Причина возврата: {{ card.repeatReason }}</div>

            <div class="card-actions">
                <button v-if="columnIndex !== 3" @click="editCard">Изменить</button>
                <button @click="deleteCard" v-if="columnIndex === 0">Удалить</button>
                <button v-if="columnIndex === 0" @click="moveToInProgress">Перенести в работу</button>
                <button v-if="columnIndex === 1" @click="moveToTesting">Перенести в тестирование</button>
                <button v-if="columnIndex === 2" @click="moveToDone">Перенести в выполненные</button>
                <button v-if="columnIndex === 2 && card.repeatReason !== undefined" @click="returnToInProgress">Вернуть</button>
            </div>

            <div v-if="showEditForm" class="edit-form">
                <label>Заголовок: </label><input v-model="editedTitle" />
                <label>Описание: </label><textarea v-model="editedDescription"></textarea>
                <label>Deadline: </label><input type="date" v-model="editedDeadline" />
                <label v-if="columnIndex === 2">Причина возврата:</label><input v-if="columnIndex === 2" v-model="editedRepeatReason" />
                <button @click="saveEdits">Сохранить</button>
                <button @click="cancelEdits">Отмена</button>
            </div>
        </div>
    `,
    data() {
        return {
            showEditForm: false, //используется для отслеживания того, нужно ли отображать форму редактирования
            editedTitle: this.card.title, //Заголовок
            editedDescription: this.card.description, //Описание
            editedDeadline: this.card.deadline, //срок
            editedRepeatReason: this.card.repeatReason, //причина возврата
        };
    },
    mounted() { //Метод который будет вызван когда компонент будет успешно вставлен в DOM
        console.log("repeatReason:", this.card.repeatReason, "columnIndex:", this.columnIndex); //Проверка
    },
    methods: { //Для редактирования, сохранения и изменений, отмены изменений, удалений, перемещений карточек
        editCard() { //Для редактирования карточки
            this.showEditForm = true;
        },
        saveEdits() { //сохранение изменений
            this.card.title = this.editedTitle;
            this.card.description = this.editedDescription;
            this.card.deadline = this.editedDeadline;
            this.card.repeatReason = this.editedRepeatReason;
            this.card.lastEdited = new Date().toLocaleString();
            this.showEditForm = false; //Скрывает форму редактирования

            this.$emit('save-edits'); //Реагирует на сохранение
        },
        //События для общения с родилельским компонентом
        cancelEdits() { //Отмена редактирования
            this.showEditForm = false;
        },
        deleteCard() { //Удаление карточки
            this.$emit('delete-card', this.columnIndex, this.cardIndex); //представляет индексы колонки и карточки, которую нужно удалить.
        },
        moveToInProgress() { //вызывается при перемещении карточки в колонку Задачи в работе
            this.$emit('move-to-in-progress', this.card, this.columnIndex, this.cardIndex);
        },
        moveToTesting() { //вызывается при перемещении карточки в колонку Тестирование
            this.$emit('move-to-testing', this.card, this.columnIndex, this.cardIndex);
        },
        moveToDone() { //вызывается при перемещении карточки в колонку Выполненные задачи
            this.$emit('move-to-done', this.card, this.columnIndex, this.cardIndex);
        },
        returnToInProgress() {
            const inProgressIndex = 1; //Индекс колонки

            this.$emit('save-edits', { //Сохранение
                repeatReason: this.editedRepeatReason,
            });

            this.$parent.columns[inProgressIndex].cards.push({ //новый объект карточки который содержит обновленные данные
                title: this.card.title,
                description: this.card.description,
                deadline: this.card.deadline,
                dateCreated: this.card.dateCreated,
                lastEdited: new Date().toLocaleString(),
                repeatReason: this.editedRepeatReason,
            });

            this.$parent.columns[this.columnIndex].cards.splice(this.cardIndex, 1);
            this.showEditForm = false;
        },
        moveToCompletedWithDeadlineCheck() { //Перемещение в выполненные задачи
            const completedIndex = 3; //Индекс колонки
            const deadline = new Date(this.card.deadline); //объект на основе дедлайна
            const currentDate = new Date(); //Текущая дата

            if (currentDate > deadline) { //Проверка закончено ли вовремя
                this.card.status = 'Опоздание';
            } else {
                this.card.status = 'Закончено во время';
            }

            this.$parent.columns[completedIndex].cards.push({ //новый объект карточки который содержит обновленные данные
                title: this.card.title,
                description: this.card.description,
                deadline: this.card.deadline,
                dateCreated: this.card.dateCreated,
                lastEdited: new Date().toLocaleString(),
                status: this.card.status,
                repeatReason: this.card.repeatReason,
            });

            this.$parent.columns[this.columnIndex].cards.splice(this.cardIndex, 1); //Процесс удаления карточки
        },
    },
});

new Vue({ //экзеипляр для всего приложения
    el: '#app',
    data: { //Данные приложения
        columns: [
            { name: 'Запланированные задачи', cards: [] },
            { name: 'Задачи в работе', cards: [] },
            { name: 'Тестирование', cards: [] },
            { name: 'Выполненные задачи', cards: [] }
        ],
        newCard: { title: '', description: '', deadline: '' } //Для создания новых карточек
    },
    computed: {
        isFormValid() { //используется для проверки валидности данных перед добавлением новой карточки
            return this.newCard.title && this.newCard.description && this.newCard.deadline;
        },
        canDelete() { //может ли пользователь удалять карточки из текущей колонки
            return this.columnIndex === 0;
          },
    },
    methods: { //Функции для добавления, удаления и перемещения карточек между колонками
        addCard(columnIndex) { //Добавляет новую карточку
            if (columnIndex === 0 && this.isFormValid) { //Проверка колонки и валидности данных
                const newCard = {
                    title: this.newCard.title,
                    description: this.newCard.description,
                    deadline: this.newCard.deadline,
                    dateCreated: new Date().toLocaleString(), //Дата и время создания карточки, с помощью new Date().toLocaleString()
                    lastEdited: new Date().toLocaleString() //Последнее редактирование
                };
                this.columns[columnIndex].cards.push(newCard); //Добавляется в массив соответствующей колонки
                this.clearNewCard(); //Обнуляет форму создания
            }
        },
        clearNewCard() { //обнуляет данные новой карточки
            this.newCard = { title: '', description: '', deadline: '' };
        },
        deleteCard(columnIndex, cardIndex) { //Удаление карточки из массива
            if (columnIndex >= 0 && columnIndex < this.columns.length) { //В пределах индексов колонок
                if (cardIndex >= 0 && cardIndex < this.columns[columnIndex].cards.length) { //находится в пределах допустимого диапазона индексов карточек в текущей колонке
                    this.columns[columnIndex].cards.splice(cardIndex, 1);
                }
            }
        },
        moveToInProgress(originalCard, columnIndex, cardIndex) { //перемещает карточку из текущей колонки в колонку Задачи в работе
            const inProgressIndex = 1;

            this.columns[inProgressIndex].cards.push({ //Создается новый объект карточки в колонке Задачи в работе используя данные из оригинальной карточки
                title: originalCard.title,
                description: originalCard.description,
                deadline: originalCard.deadline,
                dateCreated: originalCard.dateCreated,
                lastEdited: originalCard.lastEdited
            });

            this.columns[columnIndex].cards.splice(cardIndex, 1); //Удаляется из текущей колонки
        },
        moveToTesting(originalCard, columnIndex, cardIndex) { //перемещает карточку из текущей колонки в колонку Тестирование
            const testingIndex = 2;

            this.columns[testingIndex].cards.push({ //Создается новый объект карточки в колонке Тестирование используя данные из оригинальной карточки
                title: originalCard.title,
                description: originalCard.description,
                deadline: originalCard.deadline,
                dateCreated: originalCard.dateCreated,
                lastEdited: originalCard.lastEdited,
                repeatReason: originalCard.repeatReason,
            });

            this.columns[columnIndex].cards.splice(cardIndex, 1); //Удаляется из текущей колонки
        },
        moveToDone(originalCard, columnIndex, cardIndex) { //перемещение карточки из текущей колонки в колонку Выполненные задачи
            const doneIndex = 3;

            const deadline = new Date(originalCard.deadline); //Создается объект даты deadline на основе дедлайна из оригинальной карточки
            const currentDate = new Date(); //Создается объект текущей даты

            if (currentDate > deadline) { //Выполняется проверка просрочена ли дата дедлайна
                originalCard.status = 'С опозданием';
            } else {
                originalCard.status = 'Закончено во время';
            }

            this.columns[doneIndex].cards.push({ //Создается новый объект карточки в колонке Выполненные задачи используя данные из оригинальной карточки
                title: originalCard.title,
                description: originalCard.description,
                deadline: originalCard.deadline,
                dateCreated: originalCard.dateCreated,
                lastEdited: originalCard.lastEdited,
                status: originalCard.status
            });

            this.columns[columnIndex].cards.splice(cardIndex, 1); //Удаляется из текущей колонки
        },
        moveToCompletedWithDeadlineCheck(originalCard, columnIndex, cardIndex) {  //для перемещения карточки из текущей колонки в колонку Выполненные задачи с проверкой наличия опоздания
            const completedIndex = 3;

            const deadline = new Date(originalCard.deadline); //Создается объект даты deadline на основе дедлайна из оригинальной карточки
            const currentDate = new Date(); //Создается объект текущей даты

            if (currentDate > deadline) { //Выполняется проверка просрочена ли дата дедлайна
                originalCard.status = 'С опозданием';
            } else {
                originalCard.status = 'Закончено во время';
            }

            const cardToMove = { //Создается объект на основе данных из оригинальной карточки и установленный статус.
                title: originalCard.title,
                description: originalCard.description,
                deadline: originalCard.deadline,
                dateCreated: originalCard.dateCreated,
                lastEdited: originalCard.lastEdited,
                status: originalCard.status,
                repeatReason: originalCard.repeatReason,
            };
        
            this.$parent.columns[completedIndex].cards.push(cardToMove); //Карточка добавляется в колонку Выполненные задачи
        
            this.$parent.columns[columnIndex].cards.splice(cardIndex, 1); // удаляется из текущей колонки
        }
    }
});