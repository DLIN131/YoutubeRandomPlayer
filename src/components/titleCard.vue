<template>
    <div>
        <div class="loader">
            <div class="song">
                <p class="name ">{{title}}</p>
                <p class="artist"></p>
            </div>
        </div>
    </div>
</template>

<script setup>
    const props = defineProps({
        title: String,
    }) 
</script>

<style scoped>
.loader {
  display: flex;
  flex-direction: row;
  height: 4em;
  padding-left: 1em;
  padding-right: 1em;
  transform: rotate(180deg);
  justify-content: center;
  border-radius: 10px;
  transition: .4s ease-in-out;
  background: linear-gradient(to bottom , rgba(255, 172, 172,.5) 10%, rgba(0, 0, 0,.5) );
  margin-top: 1rem;
  max-width: 35rem ;
  min-width: 35rem;
}


.name{
  color: white;
}

.song {
  position: relative;
  transform: rotate(180deg);
  margin-right: 1em;
  color: black;
  align-self: center;
  overflow-x: hidden;
}

.artist {
  font-size: 0.6em;
}
/* 
@keyframes move6 {
  0% {
    height: 0.2em;
  }

  25% {
    height: 0.7em;
  }

  50% {
    height: 1.5em;
  }

  100% {
    height: 0.2em;
  }
} */
</style>