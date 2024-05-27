document.addEventListener('DOMContentLoaded', function () {
    const monthsBr = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const tableDays = document.getElementById('dias');
    let mes;
    let ano;
    const feriadosNacionais = {
        '1-1': 'Confraternização Universal',
        '4-21': 'Tiradentes',
        '5-1': 'Dia do Trabalho',
        '9-7': 'Independência do Brasil',
        '10-12': 'Nossa Senhora Aparecida',
        '11-2': 'Finados',
        '11-15': 'Proclamação da República',
        '12-25': 'Natal'
    };
    let tasks = [];

    function getDaysCalendar(mes, ano) {
        document.getElementById('mes').textContent = monthsBr[mes];
        document.getElementById('ano').textContent = ano;

        tableDays.innerHTML = '';

        const firstDayOfWeek = new Date(ano, mes, 1).getDay();
        const getLastDayThisMonth = new Date(ano, mes + 1, 0).getDate();
        const getLastDayPrevMonth = new Date(ano, mes, 0).getDate();

        const now = new Date();
        const diaAtual = now.getDate();

        let day = 1;
        let prevMonthDay = getLastDayPrevMonth - firstDayOfWeek + 1;
        for (let i = 0; i < 6; i++) {
            const row = tableDays.insertRow();
            for (let j = 0; j < 7; j++) {
                const cell = row.insertCell();
                if (i === 0 && j < firstDayOfWeek) {
                    cell.textContent = prevMonthDay++;
                    cell.classList.add('mes-anterior');
                } else if (day > getLastDayThisMonth) {
                    cell.textContent = day - getLastDayThisMonth;
                    cell.classList.add('proximo-mes');
                    day++;
                } else {
                    cell.textContent = day;
                    cell.dataset.day = day;
                    cell.dataset.month = mes + 1;
                    cell.dataset.year = ano;

                    if (mes === now.getMonth() && ano === now.getFullYear() && day === diaAtual) {
                        cell.classList.add('dia-atual');
                    }

                    const feriado = feriadosNacionais[`${mes + 1}-${day}`];
                    if (feriado) {
                        const span = document.createElement('span');
                        span.classList.add('feriado');
                        span.textContent = feriado;
                        cell.appendChild(span);
                        cell.classList.add('holiday');
                    }

                    const taskList = tasks.filter(task => task.eventDate === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                    taskList.forEach((task, index) => {
                        const taskElement = document.createElement('div');
                        taskElement.classList.add('task');
                        taskElement.textContent = task.eventTitle;
                        taskElement.style.backgroundColor = task.eventColor;
                    
                        taskElement.addEventListener('click', function (event) {
                            if (event.target.classList.contains('task')) {
                                const taskIndex = Array.from(this.parentNode.children).indexOf(this);
                                const clickedTask = taskList[taskIndex];
                                openEditModal(clickedTask);
                            }
                        });
                    
                        cell.appendChild(taskElement);
                    });
                    

                    cell.addEventListener('dblclick', function () {
                        const taskList = tasks.filter(task => task.eventDate === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                        if (taskList.length > 0) {
                            openModal(day, mes + 1, ano, taskList[0]); // Abre o modal com a primeira tarefa encontrada
                        } else {
                            openModal(day, mes + 1, ano); // Se não houver tarefa, abre o modal para adicionar uma nova
                        }
                    });
                    
                    day++;
                }
            }
        }
    }

    function openEditModal(task) {
        document.getElementById('eventTitleEdit').value = task.eventTitle;
        document.getElementById('eventDateEdit').value = task.eventDate;
        document.getElementById('eventEndDateEdit').value = task.eventDateFim;
        document.getElementById('eventDescriptionEdit').value = task.eventDescription;
        document.getElementById('selectedColorEdit').value = task.eventColor;
        document.getElementById('editModal').style.display = 'block';
    }

    function updateCalendar() {
        if (mes < 0) {
            mes = 11;
            ano--;
        } else if (mes > 11) {
            mes = 0;
            ano++;
        }
        getDaysCalendar(mes, ano);
    }

    let now = new Date();
    mes = now.getMonth();
    ano = now.getFullYear();
    updateCalendar();

    document.getElementById('btn_prox').addEventListener('click', function () {
        mes++;
        updateCalendar();
    });

    document.getElementById('btn_ant').addEventListener('click', function () {
        mes--;
        updateCalendar();
    });

    document.getElementById('btn_hoje').addEventListener('click', function () {
        const now = new Date();
        mes = now.getMonth();
        ano = now.getFullYear();
        updateCalendar();
    });

    document.getElementById('btn_agd').addEventListener('click', function () {
        const tasksModal = document.getElementById('tasksModal');
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        tasks.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.classList.add('agenda-task');
            taskElement.innerHTML = `
                <h3><strong>Título:</strong> ${task.eventTitle}</h3>
                <p><strong>Data Início:</strong> ${task.eventDate}</p>
                <p><strong>Data Fim:</strong> ${task.eventDateFim}</p>
                <p><strong>Cor:</strong> ${task.eventColor}</p>
            `;
            tasksList.appendChild(taskElement);
        });

        tasksModal.style.display = 'block';

        document.getElementById('closeTasksModalButton').addEventListener('click', function () {
            tasksModal.style.display = 'none';
        });
    });

    const modal = document.getElementById('eventModal');
    const span = document.getElementsByClassName('close')[0];

    span.onclick = function () {
        modal.style.display = 'none';
    };

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function () {
            const selectedColor = option.style.backgroundColor;
            document.getElementById('selectedColor').value = selectedColor;

            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });

            option.classList.add('selected');
            option.querySelector('.color-checkmark').style.visibility = 'visible';
        });

    });


    function openModal(day, month, year, task = null) {
        if (task) {
            openEditModal(task);
        } else {
            modal.style.display = 'block';
            document.getElementById('taskDay').value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            document.getElementById('eventDate').value = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
    }

    document.getElementById('addEventForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const taskDay = document.getElementById('taskDay').value;

        const eventTitle = document.getElementById('eventTitle').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventEndDate = document.getElementById('eventEndDate').value;
        const eventDescription = document.getElementById('eventDescription').value;
        const eventColor = document.getElementById('selectedColor').value;

        tasks.push({ eventDate, eventTitle, eventDateFim: eventEndDate, eventDescription, eventColor });
        console.log('Tasks:', tasks); // Adicionado para verificar se a tarefa foi salva corretamente

        modal.style.display = 'none';
        getDaysCalendar(mes, ano); // Chamando a função para atualizar o calendário com as novas tarefas

        document.getElementById('taskDay').value = '';
        document.getElementById('eventTitle').value = '';
        document.getElementById('eventDate').value = '';
        document.getElementById('eventEndDate').value = '';
        document.getElementById('eventDescription').value = '';
        document.getElementById('selectedColor').value = '';

        // taskElement.addEventListener('dblclick', () => {
        //     openEditModal(task);
        // });

        colorOptions.forEach(opt => {
            opt.classList.remove('selected');
            opt.querySelector('.color-checkmark').style.visibility = 'hidden';
        });
    });
});