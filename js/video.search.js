document.addEventListener('DOMContentLoaded', function () {
    const label_input = document.getElementsByTagName('label')

    const sort_radio = document.querySelectorAll('input[name="sort"]')
    const title_input = document.querySelector('input[name="title"]')
    const star_input = document.querySelector('input[name="star"]')
    const website_select = document.querySelector('#websites > select')
    const category_checkbox = document.querySelectorAll('input[name^="category_"]')
    const attributes_checkbox = document.querySelectorAll('input[name^="attribute_"]')
    const locations_checkbox = document.querySelectorAll('input[name^="location_"]')

    const existing_checkbox = document.querySelector('input[name="existing"]')
    const specialchar_checkbox = document.querySelector('input[name="special_char"]')

    const loader = document.getElementById('loader')
    const updBtn = document.getElementById('update')

    function daysToYears(days) {
        return Math.floor(days / 365)
    }

    // ToolTip
    $('[data-toggle="tooltip"]').tooltip()

    // Pretty DropDown
    $('select.pretty').prettyDropdown({
        height: 30,
        classic: true,
        hoverIntent: -1
    })

    const loadData = function () {
        fetch('json/video.search.php').then(function (jsonData) {
            return jsonData.json()
        }).then(function (data) {
            const wrapper = document.getElementById('videos')

            const row = document.createElement('div')
            row.classList.add('row', 'justify-content-center')

            for (let i = 0, elem = data['videos']; i < elem.length; i++) {
                let thumbnail = elem[i]['thumbnail']

                let existing = elem[i]['existing']

                let videoID = elem[i]['videoID']
                let videoName = elem[i]['videoName']
                let videoDate = elem[i]['videoDate']
                let websiteName = elem[i]['websiteName']
                let siteName = elem[i]['siteName']
                let ageInVideo = elem[i]['ageInVideo']
                let star = elem[i]['star']

                let category = elem[i]['category']
                if (!category.length) category.push('0')

                let attribute = elem[i]['attribute']
                if (!attribute.length) attribute.push('0')

                let location = elem[i]['location']
                if (!location.length) location.push('0')

                let a = document.createElement('a')
                a.classList.add('video', 'ribbon-container', 'card')
                a.href = `video.php?id=${videoID}`
                a.setAttribute('data-video-id', videoID)
                a.setAttribute('data-video-date', videoDate)
                a.setAttribute('data-ageinvideo', ageInVideo)
                a.setAttribute('data-title', videoName)
                a.setAttribute('data-star', star)
                a.setAttribute('data-website', websiteName)
                a.setAttribute('data-site', siteName)
                a.setAttribute('data-existing', existing)
                a.setAttribute('data-category-name', `["${category}"]`)
                a.setAttribute('data-attribute-name', `["${attribute}"]`)
                a.setAttribute('data-location-name', `["${location}"]`)

                let img = document.createElement('img')
                img.classList.add('lazy', 'card-img-top')
                img.setAttribute('data-src', thumbnail)

                let span = document.createElement('span')
                span.classList.add('title', 'card-title')
                span.textContent = videoName

                a.appendChild(img)
                a.appendChild(span)

                if (ageInVideo) {
                    let ribbon = document.createElement('span')
                    ribbon.classList.add('ribbon')
                    ribbon.textContent = daysToYears(ageInVideo).toString()

                    a.appendChild(ribbon)
                }
                row.appendChild(a)
            }
            wrapper.appendChild(row)
        }).then(function () {
            loader.remove()

            window.video = document.getElementsByClassName('video')
            window.video_query = document.querySelectorAll('.video')
            window.videoLength = video.length
            window.$video = $(video)
        }).then(function () {
            /** Label Click **/
            for (let i = 0; i < label_input.length; i++) {
                label_input[i].addEventListener('click', function () {
                    if (!$(label_input[i]).parents('.switch-group').length) {
                        $(label_input[i].previousSibling).click()
                    }
                })
            }

            /** FILTER **/
            /* Title Search */
            specialchar_checkbox.parentNode.addEventListener('click', titleSearch)
            title_input.addEventListener('keyup', titleSearch)

            function titleSearch() {
                let input = title_input.value.toLowerCase()
                if (specialchar_checkbox.checked) input = input
                    .replace(/</g, '')
                    .replace(/>/g, '')
                    .replace(/:/g, '')
                    .replace(/</g, '')
                    .replace(/>/g, '')
                    .replace(/\//g, '')
                    .replace(/\\/g, '')
                    .replace(/\|/g, '')
                    .replace(/\?/g, '')
                    .replace(/\*/g, '')
                    .replace(/%/g, '')
                    .replace(/"/g, "'")
                    .replace(/ {2}/g, ' ')

                $video.removeClass('hidden-title')

                $video.not(function () {
                    return this.getAttribute('data-title').toLowerCase().indexOf(input) > -1
                }).addClass('hidden-title')
            }

            /* Star Search */
            star_input.addEventListener('keyup', function () {
                let input = star_input.value.toLowerCase()
                $video.removeClass('hidden-star')

                $video.not(function () {
                    return this.getAttribute('data-star').toLowerCase().indexOf(input) > -1
                }).addClass('hidden-star')
            })

            /* Existing */
            existing_checkbox.addEventListener('change', function () {
                $video.removeClass('hidden-existing')

                if (this.checked) {
                    for (let i = 0; i < videoLength; i++) {
                        if (video[i].getAttribute('data-existing') === '0') {
                            video[i].classList.add('hidden-existing')
                        }
                    }
                }
            })

            /* Website - Site */
            if (website_select) {
                const prettyWebsite_select = document.querySelectorAll('#websites > .prettydropdown')
                $(prettyWebsite_select).on('change', function () {
                    $video.removeClass('hidden-website hidden-site')

                    let dropdown = website_select.options[website_select.selectedIndex]
                    let selectedWebsite = dropdown.getAttribute('data-wsite')
                    let selectedSite = dropdown.getAttribute('data-site')

                    for (let i = 0; i < videoLength; i++) {
                        if (selectedWebsite) {
                            let dataWsite = video[i].getAttribute('data-website')
                            let dataSite = video[i].getAttribute('data-site')

                            if (selectedWebsite !== dataWsite) { // not matching wsite
                                video[i].classList.add('hidden-website')
                            } else if (selectedSite && selectedSite !== dataSite) { // site defined & not matching site
                                video[i].classList.add('hidden-site')
                            }
                        }
                    }
                })
            }

            /* Category */
            for (let i = 0, wrapperLen = category_checkbox.length; i < wrapperLen; i++) {
                category_checkbox[i].addEventListener('change', function () {
                    category_checkbox[i].parentElement.classList.toggle('selected')

                    let category = this.name.split('category_').pop()
                    let category_class = category.replace(/ /g, '-')

                    for (let j = 0; j < videoLength; j++) {
                        let category_arr = video[j].getAttribute('data-category-name').slice(2, -2).split(',')

                        for (let k = 0, len = category_arr.length; k < len; k++) {
                            if (this.checked) {
                                if (category === 'NULL' && len === 1 && category_arr[k] === '0') {
                                    video[j].classList.add('tmp')
                                } else if (category_arr[k] === category) {
                                    video[j].classList.add('tmp')
                                }
                            }
                        }
                    }

                    if (this.checked) $video.not('.tmp').addClass(`hidden-category-${category_class}`)
                    else $video.removeClass(`hidden-category-${category_class}`)
                    $video.removeClass('tmp') // remove leftover classes
                })
            }

            /* Attributes */
            for (let i = 0, wrapperLen = attributes_checkbox.length; i < wrapperLen; i++) {
                attributes_checkbox[i].addEventListener('change', function () {
                    attributes_checkbox[i].parentElement.classList.toggle('selected')

                    let attribute = this.name.split('attribute_').pop()
                    let attribute_class = attribute.replace(/ /g, '-')

                    for (let j = 0; j < videoLength; j++) {
                        let attribute_arr = video[j].getAttribute('data-attribute-name').slice(2, -2).split(',')

                        for (let k = 0, len = attribute_arr.length; k < len; k++) {
                            if (this.checked && (attribute_arr[k] === attribute)) {
                                video[j].classList.add('tmp')
                            }
                        }
                    }

                    if (this.checked) $video.not('.tmp').addClass(`hidden-attribute-${attribute_class}`)
                    else $video.removeClass(`hidden-attribute-${attribute_class}`)
                    $video.removeClass('tmp') // remove leftover classes
                })
            }

            /* Location */
            for (let i = 0, wrapperLen = locations_checkbox.length; i < wrapperLen; i++) {
                locations_checkbox[i].addEventListener('change', function () {
                    locations_checkbox[i].parentElement.classList.toggle('selected')

                    let location = this.name.split('location_').pop()
                    let location_class = location.replace(/ /g, '-')

                    for (let j = 0; j < videoLength; j++) {
                        let location_arr = video[j].getAttribute('data-location-name').slice(2, -2).split(',')

                        for (let k = 0, len = location_arr.length; k < len; k++) {
                            if (this.checked && (location_arr[k] === location)) {
                                video[j].classList.add('tmp')
                            }
                        }
                    }

                    if (this.checked) $video.not('.tmp').addClass(`hidden-location-${location_class}`)
                    else $video.removeClass(`hidden-location-${location_class}`)
                    $video.removeClass('tmp') // remove leftover classes
                })
            }

            /** SORT **/
            /* Sort Radio */
            for (let i = 0; i < sort_radio.length; i++) {
                sort_radio[i].addEventListener('change', function () {
                    $(sort_radio).parent().removeClass('selected')
                    sort_radio[i].parentElement.classList.add('selected')

                    let label = this.id

                    let alphabetically = function (a, b) {
                        return a.querySelector('span').innerHTML.toLowerCase().localeCompare(b.querySelector('span').innerHTML.toLowerCase(), 'en')
                    }

                    let alphabetically_reverse = function (a, b) {
                        return b.querySelector('span').innerHTML.toLowerCase().localeCompare(a.querySelector('span').innerHTML.toLowerCase(), 'en')
                    }

                    let added = function (a, b) {
                        return a.getAttribute('data-video-id') - b.getAttribute('data-video-id')
                    }

                    let added_reverse = function (a, b) {
                        return b.getAttribute('data-video-id') - a.getAttribute('data-video-id')
                    }

                    let actor_age = function (a, b) {
                        return a.getAttribute('data-ageinvideo') - b.getAttribute('data-ageinvideo')
                    }

                    let actor_age_reverse = function (a, b) {
                        return b.getAttribute('data-ageinvideo') - a.getAttribute('data-ageinvideo')
                    }

                    let video_date = function (a, b) {
                        return new Date(a.getAttribute('data-video-date')) - new Date(b.getAttribute('data-video-date'))
                    }

                    let video_date_reverse = function (a, b) {
                        return new Date(b.getAttribute('data-video-date')) - new Date(a.getAttribute('data-video-date'))
                    }


                    switch (label) {
                        case 'alphabetically':
                            $video.sort(alphabetically)
                            break
                        case 'alphabetically_desc':
                            $video.sort(alphabetically_reverse)
                            break
                        case 'added':
                            $video.sort(added)
                            break
                        case 'added_desc':
                            $video.sort(added_reverse)
                            break
                        case 'date':
                            $video.sort(video_date)
                            break
                        case 'date_desc':
                            $video.sort(video_date_reverse)
                            break
                        case 'actor-age':
                            $video.sort(actor_age)
                            break
                        case 'actor-age_desc':
                            $video.sort(actor_age_reverse)
                            break
                        default:
                            console.log(`No sort method for: ${label}`)
                    }

                    for (let i = 0; i < videoLength; i++) {
                        $video[i].parentNode.appendChild($video[i])
                    }
                })
            }
        }).then(function () {
            new LazyLoad({
                elements_selector: '.lazy',
                threshold: 300
            })
        })
    }
    loadData()

    updBtn.addEventListener('click', function () {
        resetData()
        loadData()
    })
})

function resetData() {
    $('.video').remove()
}