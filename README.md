
# mod-player

module (.mod) player in javascript

## Example

```js
function play(buffer){
  if (playing) playing.disconnect();
  var mod = new ModParser(buffer);
  var player = new ModPlayer(mod, rate, size);
  var node = playing = process(audio, size, player.process);
  node.connect(audio.destination);
}
```

## Credits

* [gasman](https://github.com/gasman) [original](https://github.com/gasman/jsmodplayer)
* [BillyWM](https://github.com/BillyWM) [improvements (fork based upon)](https://github.com/BillyWM/jsmodplayer)

## License

MIT
