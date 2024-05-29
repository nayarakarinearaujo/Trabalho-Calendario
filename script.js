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
        const mesElement = document.getElementById('mes');
        const anoElement = document.getElementById('ano');

        if (mesElement && anoElement) {
            mesElement.textContent = monthsBr[mes];
            anoElement.textContent = ano;
        }

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

                    const taskList = tasks.filter(task => task.eventDate === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ||
                        task.eventDateFim === `${ano}-${String(mes + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
                    taskList.forEach(task => {
                        const taskElement = document.createElement('div');
                        taskElement.classList.add('task');
                        taskElement.textContent = task.eventTitle;
                        taskElement.style.backgroundColor = task.eventColor;

                        cell.appendChild(taskElement);

                        // Adicionando evento de clique para abrir o modal de edição da tarefa existente
                        taskElement.addEventListener('click', function (event) {
                            event.stopPropagation(); // Impede que o evento de clique seja propagado para o modal de adição
                            openEditModal(task);
                        });
                    });

                    cell.addEventListener('dblclick', function () {
                        openModal(day, mes + 1, ano);
                    });

                    day++;
                }
            }
        }
    }

    function openEditModal(task) {
        const editModal = document.getElementById('editModal');
        if (!editModal) return;

        document.getElementById('eventTitleEdit').value = task.eventTitle;
        document.getElementById('eventDateEdit').value = task.eventDate;
        document.getElementById('startTimeEdit').value = task.startTime;
        document.getElementById('eventEndDateEdit').value = task.eventDateFim;
        document.getElementById('endTimeEdit').value = task.endTime;
        document.getElementById('eventDescriptionEdit').value = task.eventDescription;
        document.getElementById('selectedColorEdit').value = task.eventColor;
        editModal.style.display = 'block';
    }

    const closeEditModalButton = document.getElementById('closeEditModalButton');
    if (closeEditModalButton) {
        closeEditModalButton.addEventListener('click', function () {
            const editModal = document.getElementById('editModal');
            if (editModal) {
                editModal.style.display = 'none';
            }
        });
    }

    
    // Função para apagar uma tarefa
    function deleteTask() {
        const index = tasks.findIndex(task => task.eventDate === document.getElementById('eventDateEdit').value);
        if (index !== -1) {
            tasks.splice(index, 1);
            console.log('Tarefa apagada:', tasks);
            editModal.style.display = 'none';
            updateCalendar();
        }
    }

    const deleteTaskButton = document.querySelector('.btn_del');
    if (deleteTaskButton) {
        deleteTaskButton.addEventListener('click', function () {
            deleteTask();
        });
    }

     // Manipuladores de eventos para seleção de cores durante a edição de tarefas
     const colorOptionsEdit = document.querySelectorAll('.color-option');
     const selectedColorEdit = document.getElementById('selectedColorEdit');
 
     colorOptionsEdit.forEach(option => {
         option.addEventListener('click', function () {
             const selectedColor = option.style.backgroundColor;
             selectedColorEdit.value = selectedColor;
 
             colorOptionsEdit.forEach(opt => {
                 opt.classList.remove('selected');
                 opt.querySelector('.color-checkmark').style.visibility = 'hidden';
             });
 
             option.classList.add('selected');
             option.querySelector('.color-checkmark').style.visibility = 'visible';
         });
     });

    window.addEventListener('click', function (event) {
        const editModal = document.getElementById('editModal');
        if (event.target == editModal) {
            editModal.style.display = 'none';
        }
    });


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

    const now = new Date();
    mes = now.getMonth();
    ano = now.getFullYear();
    updateCalendar();

    const btnProx = document.getElementById('btn_prox');
    const btnAnt = document.getElementById('btn_ant');
    const btnHoje = document.getElementById('btn_hoje');
    const btnAgd = document.getElementById('btn_agd');

    if (btnProx) {
        btnProx.addEventListener('click', function () {
            mes++;
            updateCalendar();
        });
    }

    if (btnAnt) {
        btnAnt.addEventListener('click', function () {
            mes--;
            updateCalendar();
        });
    }

    if (btnHoje) {
        btnHoje.addEventListener('click', function () {
            const now = new Date();
            mes = now.getMonth();
            ano = now.getFullYear();
            updateCalendar();
        });
    }

    if (btnAgd) {
        btnAgd.addEventListener('click', function () {
            const tasksModal = document.getElementById('tasksModal');
            const tasksList = document.getElementById('tasksList');
            if (!tasksModal || !tasksList) return;

            tasksList.innerHTML = '';

            tasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('agenda-task');
                taskElement.innerHTML = `
                    <h3><strong>Título:</strong> ${task.eventTitle}</h3>
                    <p><strong>Data Início:</strong> ${task.eventDate}</p>
                    <p><strong>Horário Início:</strong> ${task.startTime}</p>
                    <p><strong>Data Fim:</strong> ${task.eventDateFim}</p>
                    <p><strong>Horário Fim:</strong> ${task.endTime}</p>
                    <div class="color-box" style="background-color: ${task.eventColor};"></div>
                    `;
                tasksList.appendChild(taskElement);
            });

            tasksModal.style.display = 'block';
        });


        const tasksModal = document.getElementById('tasksModal');
        const closeTasksModalButton = document.querySelector('.close-tasks-modal');
    
        if (closeTasksModalButton) {
            closeTasksModalButton.addEventListener('click', function () {
                if (tasksModal) {
                    tasksModal.style.display = 'none';
                }
            });
        }
    
        window.addEventListener('click', function (event) {
            if (event.target == tasksModal) {
                tasksModal.style.display = 'none';
            }
        });

    }

    const modal = document.getElementById('eventModal');
    const span = document.getElementsByClassName('close')[0];

    if (span) {
        span.onclick = function () {
            if (modal) {
                modal.style.display = 'none';
            }
        };
    }

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

    function openModal(day, month, year) {
        if (!modal) return;

        modal.style.display = 'block';
        const now = new Date();
        const currentDateTime = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        document.getElementById('currentDateTime').textContent = currentDateTime;

        const currentDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        document.getElementById('taskDay').value = currentDate;
        document.getElementById('eventDate').value = currentDate;
        document.getElementById('startTime').value = currentTime;
    }

    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const taskDay = document.getElementById('taskDay').value;

            const eventTitle = document.getElementById('eventTitle').value;
            const eventDate = document.getElementById('eventDate').value;
            const startTime = document.getElementById('startTime').value;
            const eventEndDate = document.getElementById('eventEndDate').value;
            const endTime = document.getElementById('endTime').value;
            const eventDescription = document.getElementById('eventDescription').value;
            const eventColor = document.getElementById('selectedColor').value;

            tasks.push({ eventDate, eventTitle, startTime, eventDateFim: eventEndDate, endTime, eventDescription, eventColor });
            console.log('Tasks:', tasks);

            modal.style.display = 'none';
            getDaysCalendar(mes, ano);

            document.getElementById('taskDay').value = '';
            document.getElementById('eventTitle').value = '';
            document.getElementById('eventDate').value = '';
            document.getElementById('startTime').value = '';
            document.getElementById('eventEndDate').value = '';
            document.getElementById('endTime').value = '';
            document.getElementById('eventDescription').value = '';
            document.getElementById('selectedColor').value = '';

            colorOptions.forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.color-checkmark').style.visibility = 'hidden';
            });
        });
    }
});


