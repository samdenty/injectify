var embed = document.createElement('embed')
embed.style = 'width: 100%; height: 100%;'
embed.src = module.params

document.head.innerHTML = '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
document.body.innerHTML = embed.outerHTML
document.body.style = 'margin: 0; width: 100%; height: 100%; '