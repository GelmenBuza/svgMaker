# Аудит проекта svg_maker

Список ошибок, недочётов, неиспользуемого кода и предложений по исправлению. Строки — по состоянию файлов на момент обследования.

---

## Критические нарушения Rules of Hooks (React)

1. **`src/components/DraggableSettings.jsx` — строки 27–64, 66–78, 157–175**  
   После `if (!customEll) return null` (стр. 27) вызываются `useMemo`, `useRef`, `useState`, `useEffect`. При первом рендере без элемента хуков меньше, чем при следующем — порядок хуков ломается.  
   **Исправление:** убрать ранний `return` до всех хуков; либо вынести оверлей в дочерний компонент, который монтируется только при `customEll`; все хуки вызывать безусловно на верхнем уровне.

2. **`src/components/DraggableDots/index.jsx` — строки 19–25**  
   После `if (!customEll) return null` (стр. 19) идут `useState`, `useRef`, `useMemo`.  
   **Исправление:** как выше — сначала все хуки, потом условный рендер; или вынести тело в `<DraggableDotsInner id={id} />` при наличии `customEll`.

3. **`src/components/CustomContextMenu/index.jsx` — строка 187**  
   `useState` вызывается внутри ветки `if (menuType === 'vertex')`.  
   **Исправление:** поднять `useState` наверх компонента; для режима «не vertex» использовать безопасное начальное значение или отдельный подкомпонент `VertexContextMenu` с собственными хуками.

---

## Ошибки логики / потенциальные падения в runtime

4. **`src/components/ElementsSettings/index.jsx` — строки 56–58**  
   При `deltaAngle === 0` вызывается `updateElements([{...targetElement, rotate: newAngel}])`. В `elementsStore` сигнатура `(id, data)` или `(fn)`; массив как первый аргумент не обрабатывается — обновление стора не произойдёт.  
   **Исправление:** вызвать `updateElements(targetElement.id, { rotate: newAngel })` или `updateElements(prev => prev.map(...))` в соответствии с принятой схемой.

5. **`src/components/CustomContextMenu/index.jsx` — строки 177–179, 234–246**  
   Для меню по элементу (`menuType === 'element'`) `currentEl` берётся из `customizableElementId`, а не из `menu.id` (id элемента под курсором). ПКМ по пути без открытых настроек может дать `undefined` и падение на `currentEl` / `addNewVertex`.  
   **Исправление:** резолвить элемент так: `elements.find(el => el.id === menu.id)` (и отдельно обрабатывать отсутствие).

6. **`src/utils/getMinMaxCords.js` — строки 2–4**  
   При пустом `pointsArr` выполняется `return` без значения (`undefined`).  
   **`src/components/DraggableSettings.jsx` — строка 30**  
   Деструктуризация `const {min, max} = useMemo(() => getMinMaxCords(currentPointsArr), ...)` при пустом пути (например, новый DIY до первой точки) приведёт к ошибке.  
   **Исправление:** в `getMinMaxCords` всегда возвращать объект, например `{ min: [0,0], max: [0,0] }`; в `DraggableSettings` не рендерить оверлей при `!currentPointsArr.length`.

7. **`src/components/CustomContextMenu/index.jsx` — строки 248–250**  
   Если `menu.id` не содержит ни `vertex`, ни ожидаемого шаблона для `element`, компонент ничего не возвращает (`undefined`).  
   **Исправление:** явный `return null` в конце или объединить ветки с безопасным fallback.

---

## ESLint / React Compiler (текущий `npm run lint`)

8. **`src/App.jsx` — строки 216–246**  
   Предупреждения/ошибки `react-hooks/exhaustive-deps` (нет `openSettings`, `handleContextMenu` в deps) и `react-hooks/preserve-manual-memoization` (React Compiler и мутации зависимостей).  
   **Исправление:** стабилизировать колбэки через `useCallback` с корректными зависимостями или убрать `useMemo` там, где компилятор не может его сохранить; выровнять deps с фактическим использованием.

9. **`src/components/DraggablePath.jsx` — строка 19**  
   `cx`, `cy` из `getCenterPath` не используются (`no-unused-vars`).  
   **Исправление:** удалить деструктуризацию или использовать (например, для подписи/debug).

10. **`src/components/ElementsSettings/index.jsx` — строки 9, 17**  
    Неиспользуемые `setCustomizableElement`, `element_type`.  
    **Исправление:** удалить из деструктуризации и объявлений.

11. **`src/utils/parsePathData.js` — строки 239–242**  
    В ветке `A` параметры дуги (`rx`, `ry`, флаги) читаются, но не используются (`no-unused-vars`).  
    **Исправление:** префикс `_` или комментарий eslint-disable для намеренно пропускаемых токенов; либо реализовать корректную геометрию дуги вместо упрощённого узла.

---

## Неиспользуемое API стора и «мёртвое» состояние

12. **`src/stores/elementsStore.jsx`**  
    - **`areaHeight` (стр. 9)** — нигде не читается.  
    - **`clearSelected` (стр. 37)** — не вызывается.  
    - **`getCustomizableElement` (стр. 149–152)** — не вызывается.  
    - **`updateElementPoints`, `addPoint`, `updatePoint`, `removePoint` (стр. 78–140)** — не используются снаружи стора.  
    - **`getElementRotation` (стр. 22–24)** — не используется; при этом **`setElementRotation` (стр. 13–19)** вызывается из `DraggableSettings`, а **`elementRotation` (стр. 11, 15–17)** на рендер не влияет.  
    **Исправление:** удалить неиспользуемое или подключить (например, `areaHeight` для viewBox); для поворота — либо хранить только `el.rotate` в `elements`, либо читать `elementRotation` там, где нужна визуализация.

---

## Лишний / избыточный код в компонентах

13. **`src/components/DraggablePath.jsx` — строки 98–99, 102**  
    `displayD = useMemo(() => d, [d])` эквивалентно использованию `d` напрямую.  
    **Исправление:** убрать `useMemo`, передать в `<path d={d} ... />`.

14. **`src/App.jsx` — строка 239**  
    В `DraggablePath` передаётся `rotate={el.rotate}`, но компонент **не объявляет** проп `rotate` и не применяет поворот к `<path>`.  
    **Исправление:** либо удалить проп из `App`, либо добавить в `DraggablePath` `transform={`rotate(${rotate}, ${cx}, ${cy})`}` (с центром) и деструктуризацию `rotate`, согласовав с тем, как хранится угол в данных.

15. **`src/components/DraggableDots/index.jsx` — строки 9–10**  
    Проп `onDragEnd` объявлен, из `App` не передаётся — всегда `undefined` (не ошибка, но шум).  
    **Исправление:** убрать из пропсов или прокинуть из `App`, если нужен колбэк после драга.

16. **`src/App.jsx` — строки 224–225**  
    `onDragEnd: () => {}` — пустой колбэк без смысла.  
    **Исправление:** удалить из `commonProps` и из `DraggablePath`, если не планируется логика.

17. **`src/App.jsx` — строки 97–98, 116–117**  
    Закомментированные фрагменты `d` и `console.log("+")` в `openSettings`.  
    **Исправление:** удалить отладочный вывод и мёртвые комментарии.

---

## Антипаттерны и технический долг

18. **`src/components/DraggableSettings.jsx` — строки 49–64**  
    В теле рендера вызываются `setDragAngle(null)` и другие обновления состояния при смене `id`. Это лишние ререндеры и граничные случаи с React 19.  
    **Исправление:** перенести сброс в `useEffect` по `[id]` или ключом `<DraggableSettings key={id} />` с инициализацией внутри без setState в render.

19. **`src/components/DraggableSettings.jsx` — строка 190**  
    `style.cursor` зависит от `isDraggingRef.current` — ref не вызывает ре-рендер, курсор «grabbing» может не обновиться.  
    **Исправление:** дублировать флаг в `useState` для UI или вычислять курсор из `dragAngle !== null` / состояния перетаскивания.

20. **`src/components/DraggableDots/index.jsx` — `handlePointerMove`**  
    Мутируется массив `dotsArr` из замыкания (результат парсинга), затем передаётся в `onDrag`. Нарушение иммутабельности React/Zustand.  
    **Исправление:** клонировать точки (`structuredClone` / map) перед изменением и передавать новый массив.

21. **`src/components/DraggableDots/index.jsx` — строки 128–249**  
    Дублируется большой блок логики для `symmetric` / `smooth` (внутри `if (dotsArr[0].x === obj.x...)` и снова ниже).  
    **Исправление:** вынести в функцию `applyHandleDrag(type, obj, delta, initial, targetId, ...)`.

22. **`src/App.jsx` — `generateSVGCode` — строки 49–59**  
    В `default` ветке `switch` возвращается `undefined`, в `join('\n')` попадут пустые дыры при новых типах элементов.  
    **Исправление:** возвращать пустую строку или комментарий в SVG; расширить генератор под новые `type`.

23. **`src/components/ElementsSettings/index.jsx` — `handleChange` — строки 35–39**  
    Вторым аргументом в `updateElements` передаётся `{...element, [field]: newValue }` — лишние поля игнорируются ветками стора, но это хрупко при расширении `updateElements`.  
    **Исправление:** передавать только изменяемые поля, например `{ [field]: newValue }` с явной обработкой в сторе.

24. **`src/components/CustomContextMenu/index.jsx` — строки 90–173 `changeType`**  
    Дублируются два `switch (value)` (вложенный при совпадении с первой точкой и общий) — риск расхождения при правках.  
    **Исправление:** объединить в одну таблицу/функцию применения типа.

---

## Разное (a11y, консистентность)

25. **`src/components/CustomContextMenu/index.jsx` — метки `label htmlFor=""` (стр. 199, 207, …)**  
    Пустой `htmlFor` и пустой `id` у инпутов ухудшают доступность.  
    **Исправление:** задать уникальные `id` и связать с `htmlFor`.

26. **`src/stores/elementsStore.jsx`**  
    Файл с расширением `.jsx` без JSX.  
    **Исправление:** переименовать в `elementsStore.js` для ясности (опционально).

27. **`index.html` — строка 2**  
    `lang="en"` при русскоязычном UI в контекстном меню.  
    **Исправление:** при желании выставить `lang="ru"`.

---

## Итог по командам

- **`npm run lint`** — завершается с ошибками (см. п. 1–3, 8–11).  
- **`npm run build`** — на момент проверки проходил успешно; это не отменяет логических багов и нарушений хуков.

Рекомендуемый порядок: сначала исправить Hooks (п. 1–3), затем `updateElements` в ElementSettings (п. 4) и резолв элемента в контекстном меню (п. 5–6), после — зачистка lint и мёртвого кода.



# Важно
- Надо доделать логику обработки смены типа узла в замкнутом узле