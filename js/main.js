Vue.component('kanban-card', {
    props: ['card', 'columnIndex', 'cardIndex'],
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
                <button v-if="columnIndex === 3" @click="moveToCompletedWithDeadlineCheck">Проверить статус </button>
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
            showEditForm: false,
            editedTitle: this.card.title,
            editedDescription: this.card.description,
            editedDeadline: this.card.deadline,
            editedRepeatReason: this.card.repeatReason,
        };
    },
});