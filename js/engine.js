// в файле scenario.js содержится массив объектов textNodes со сценарием

const firstButtonElement = document.getElementById("btn-start1");
const coinCounterElement = document.getElementById("coin-counter")
const startBlockElement = document.getElementById("start-block")
const testElement = document.getElementById("test")
const footerElement = document.getElementById("footer")
const headerElement = document.getElementById("header")
var animalArray = []
var result = 0

firstButtonElement.onclick = function(e) {
    // создание section, в который в дальнейшем будут добавляться блоки
    const row = document.createElement("div")
    row.className = 'row'
    const col = document.createElement("div")
    col.className = 'col-xs-12 col-sm-12 col-md-12 col-lg-12'
    const situat = document.createElement("section")
    situat.className = 'situations'
    situat.id = 'situations'
    document.body.insertBefore(row, footer)
    row.append(col)
    col.append(situat)

    progressBar(10)

    newblock(1)
    const firstBlock = document.getElementById('block-1')
    startBlockElement.style.display = 'none'
    
    scrollingToElem(firstBlock)

}

// шкала прохождения теста (на вход принимает количество колонок, которое нужно создать)
function progressBar (columns) {
    var progressBar = document.createElement("div")
    progressBar.className = 'progress-bar'
    progressBar.id = 'progress-bar'
    headerElement.append(progressBar)

    i = 0
    while (i != columns) {
        ++i
        var point = document.createElement("div")
        point.className = 'progress-bar-column'
        point.id = `column-${i}`
        point.style['background-color'] = 'var(--progress-bar-color)'
        point.style.opacity = "0"
        progressBar.append(point)
    }
}

// добавление нового блока в section class="situations"
function newblock (blockId) {
    const situationsElement = document.getElementById("situations")
    var blockNode = textNodes.find(blockNode => blockNode.id == blockId);
    var block = document.createElement('div');
    block.classList.add('block');
    block.id = `block-${blockId}`;
    situationsElement.append(block)

    if (blockNode.endTag) {endBlock(block, blockId, blockNode)} else {blockPush(blockId, blockNode, block)}
}

// наполнение <div class="block">, созданного в newblock
function blockPush (blockId, blockNode, block) { 
    
    if (!blockNode) {
        blockNode = textNodes.find(blockNode => blockNode.id == 1488)
    }

    var h2 = document.createElement("h2") // <h2>
    h2.className = 'h2', 
    h2.innerText = blockNode.title
    block.append(h2);

    creatingP (blockNode.text, block, 'text', blockId)

    // div для кнопок выбора и появляющегося комментария
    var buttonsGrid = document.createElement("div")
    buttonsGrid.className = 'buttons-grid'
    buttonsGrid.id = `buttons-grid${blockId}`
    block.append(buttonsGrid)

    for (i = blockNode.options.length; i != 0; --i) {
        addChooseButtonsToGrid(block, blockId, blockNode, buttonsGrid, i)
    }
}

// наполнение buttons-grid кнопками (кнопка подтверждения - отдельная функция addSubmitButton)
function addChooseButtonsToGrid (block, blockId, blockNode, buttonsGrid, i) {
    // button
    var nodeOpt = blockNode.options[i-1]
    const button = document.createElement('button');
    button.className = 'btn-choose'
    button.type = `choose-block${blockId}`
    button.id = `btn-radio${blockId}${blockNode.options[i-1].variant}`
    button.value = `${blockNode.options[i-1].variant}`
    button.innerText = nodeOpt.buttonText;
    buttonsGrid.append(button)

    button.addEventListener('click', function(e) {

        var answerButtons = document.querySelectorAll(`[type="choose-block${blockId}"]`) // выбираем все кнопки выбора из buttons-grid
        answerButtons.forEach((g) => {
            if (g !== e.target) {
                g.setAttribute('disabled', true)
            }
        })

        var value = e.target.value
        var ind = 99999
        blockNode.options.forEach((e) => { // получение индекса необходимого словаря в options
            if (e.variant === value) {
                return ind = blockNode.options.indexOf(e)
            }
        })
        var commentColor = true
        // проверка, правильный ли ответ
        if (blockNode.options[ind].scoreAchieved === true) {
            ++result
            commentColor = true
        } else commentColor = false 
        console.log(commentColor)

        comment (blockId, blockNode, buttonsGrid, ind, value, commentColor)

        addNextBlockButton (block, blockId, blockNode)

        // скролл
        var currentComment = document.getElementById(`comment-${blockId}`)
        scrollingToElem(currentComment)
    }, 
    // для предотвращения повторного события по нажатию на кнопку выбора
    {once : true}
    )
}

// добавление комментария к выбранному варианту ответа
function comment (blockId, blockNode, buttonsGrid, ind, value, commentColor) { // комментарий
    // создание блока для коммента
    var commentDiv = document.createElement("div")
    commentDiv.className = "comment"
    commentDiv.id = `comment-${blockId}`
    commentDiv.style['background-color'] = `var(--color-${commentColor})`
    buttonsGrid.append(commentDiv)

    // создание текста коммента
    creatingP (blockNode.options[ind].comment, commentDiv, 'comment', blockId)
}

// кнопка "далее", добавляющая новый блок функцией newblock, описанной ранее
function addNextBlockButton (block, blockId, blockNode) {
    var nextbutton = document.createElement('button')
    nextbutton.type = 'to-next-block'
    nextbutton.classList.add('to-next-block');
    nextbutton.id = `to-next-block${blockId}`
    nextbutton.innerText = 'Далее';
    block.append(nextbutton)


    nextbutton.onclick = function() {
        // прячем кнопку после нажатия
        newblock(blockNode.nextBlockId)
        nextbutton.style.display = 'none'

        // скролл к следующему блоку по нажатию на "далее"
        var nextBlock = document.getElementById(`block-${blockNode.nextBlockId}`)
        scrollingToElem(nextBlock)

        // закрашивание прогрессбара
        var completePoint = document.getElementById(`column-${blockId}`)
        completePoint.style.opacity = "1"

    }
}


// наполнение <div class="block">, созданного в newblock (концовка)
function endBlock(block, blockId, blockNode) {
    // подсчитать, сколько набрал жетончиков
    var indWinner = 99999
    blockNode.endings.forEach((e) => { // получение индекса необходимого словаря в options
        if (e.endingPoints.includes(result)) {
            return indWinner = blockNode.endings.indexOf(e)
        }
    })

    // добавить на фон финального блока животное в зависимости от набранных баллов
    if (result > 4) {
        block.style['background-image'] = "url('img/win.png')"
    } else {
        block.style['background-image'] = "url('img/lose.png')"
    }
    block.style['background-size'] = '34%'
    block.style['background-repeat'] = 'no-repeat'
    block.style['background-size'] = '34%'
    block.style['background-position'] = 'right bottom'
    block.style.position = 'relative'

    // заголовок [какое вы животное]
    var title = document.createElement("h2")
    title.className = 'h2 h2-ending'
    title.id = 'h2-ending'
    title.innerText = `${blockNode.endings[indWinner].smile} Вы ${blockNode.endings[indWinner].animal}*`
    block.append(title)

    // текст [зависит от количества набранных баллов]
    var finaltext = document.createElement("p")
    finaltext.className = 'p p-ending'
    finaltext.id = 'p-ending'
    finaltext.innerText = `${blockNode.endings[indWinner].endingText}`
    block.append(finaltext)

    animalsDescription(block, blockNode)

    // рестарт баттон
    addRestartButton (blockId, block)
}

// комментарий, касающийся результата
function animalsDescription(block, blockNode) {
    // Отдельный div 
    var descrDiv = document.createElement("div")
    descrDiv.className = 'description'
    descrDiv.id = 'description'
    block.append(descrDiv)
    // Заголовок комментария, поясняющего зарабатываемые баллы
    var description = document.createElement("p")
    description.className = 'p p-ending-animals'
    description.id = 'p-animals'
    description.innerText = `${blockNode.scoreText}`
    descrDiv.append(description)

    // описание того, какое ты животное
    let table = document.createElement('ul')
    table.className = 'ul_which-animal'
    table.id = 'il_which-animal'
    descrDiv.append(table)

    let i = 0
    while(i != 4) {
        var str = document.createElement(`li`)
        str.className = 'li-animal'
        str.id = `animal${i}`
        str.innerText = `${blockNode.scoreAnimals[i].li}`
        table.append(str)
        ++i
    }
}

// кнопка для перезапуска игры
function addRestartButton (blockId, block) {
    const restartButton = document.createElement('button');
    restartButton.type = 'restart'
    restartButton.classList.add('btn-restart');
    restartButton.id = `btn-restart${blockId}`
    restartButton.innerText = 'Попробовать снова';
    block.append(restartButton) 
    restartButton.onclick = function() {
        // очистка div="situation"
        const situationsElement = document.getElementById("situations")
        situationsElement.innerHTML = ""
        // очистка результатов
        result = 0
        i = 0
        while (i != 10) {
            ++i
            point = document.getElementById(`column-${i}`)
            point.style.opacity = "0"
        }

        newblock(1)
        
        // скролл
        var questRestart = document.getElementById('situations')
        scrollingToElem(questRestart)
    } 
}

// функция для создания <p>
function creatingP (array, addPoint, textKey, blockId) {
    let i = 0
    array.forEach(function(){
        var textNode = document.createElement("p")
        textNode.className = `p-${textKey}`
        textNode.id = `p-${blockId}-${i}`
        textNode.innerText = `${array[i]}`
        addPoint.append(textNode)
        ++i
    })
}

// просчёт y-координаты элемента относительно окна. вызывается, как правило, в функции onclick для скролла к элементу
function scrollingToElem(elem) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return window.scrollTo({
        top: Math.round(top) - header.clientHeight,
        left: 0,
        behavior: 'smooth'
      })
}