<script lang="ts">
	import { addDream, dreams, likedDreamIds, likeDream } from "../stores/store";
  import { crossfade, scale, fly } from "svelte/transition"
	import { clickOutside } from "../lib/clickOutside";
	import { truncate } from "../lib/helpers";
  import { sortBy } from "lodash"

  let dream = ''
  let reason = ''
  let expandedDream: Dream | null
  let dreamIdJustLiked = ''
  const filterOptions = ['latest', 'top']
  let activeFilter = 'latest'
  let sortedDreams: Dream[] = []

  const expandDream = (dream: Dream | null) => {
    expandedDream = dream
  }

  const handleSubmit = () => {
    addDream(dream, reason)
    dream = ''
    reason = ''
  }

  const handleKeypress = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault()
      handleSubmit()
    }
  }

  const handleLike = (dreamId: Dream['id']) => {
    likeDream(dreamId)
    dreamIdJustLiked = dreamId
    console.log(dreamIdJustLiked)
  }

  const [send, receive] = crossfade({
    duration: 200,
    fallback: scale
  });

  $: sortedDreams = activeFilter === 'top' ? sortBy($dreams, 'likes') : $dreams

</script>

<div class="z-10 fixed bottom-0 left-0 w-screen h-1/6 bg-gradient-to-b from-transparent to-stone-800 pointer-events-none" />

<h1 class="mt-4 text-center text-5xl">
  <span class="font-extralight opacity-70 mr-1">What would you do with a</span> <span class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-600">universal basic income?</span>
</h1>

<div class="text-3xl">
  <div class="flex items-center justify-center mt-12">
    <span class="mr-8">I would</span>
    <div class="relative">
      <input type="text" maxlength="100" bind:value={dream} on:keypress={handleKeypress} on:submit={handleSubmit} />
    </div>
  </div>
  <div class="flex items-center justify-center mt-4">
    <span class="mr-8">because</span>
    <div class="relative">
      <input type="text" maxlength="100" bind:value={reason} on:keypress={handleKeypress} on:submit={handleSubmit} />
      {#if dream && reason}
        <div transition:fly={{x: -30, duration: 500}} class="pl-4 absolute -right-14 top-4">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" on:click={handleSubmit} class="w-10 h-10 ml-4 opacity-80 transition-opacity hover:opacity-100 cursor-pointer">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      {/if}
    </div>
  </div>
</div>


<div class="flex space-x-8 text-xl justify-center mt-12">
  {#each filterOptions as filterOption}
    {@const active = filterOption === activeFilter}
    <div class="filter-button" class:active on:click={() => activeFilter = filterOption}>{filterOption}</div>
  {/each}
</div>

{#if expandedDream}
  <div class="fixed inset-0 cursor-pointer" on:click={() => {expandDream(null)}} />
  {#await expandedDream then d}
    <div
      class="fixed inset-0 bg-white z-20 bg-opacity-5 backdrop-blur-sm shadow-xl rounded-lg cursor-pointer"
      on:click={() => expandDream(null)}
      in:receive={{key:d.id}}
      out:send={{key:d.id}}
    >
      <div class="p-8 w-full h-full backdrop-blur bg-black bg-opacity-60 rounded-lg flex items-center">
        <div class="select-none text-4xl space-x-2 items-center w-full">
          <div class="flex flex-col space-y-8 max-w-2xl mx-auto">
            <div class="pr-10">
              <span class="opacity-60 mr-1 font-extralight">I would</span>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-purple-400 to-pink-600 font-extrabold">{d.text}</span>
            </div>
            <div class="text-3xl">
              <span class="opacity-60 mr-1 font-light">because</span>
              <span class="font-bold">{d.reason}</span>
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            on:click|stopPropagation={() => handleLike(d.id)}
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="absolute top-4 right-4 w-16 h-16 mt-1 p-4 cursor-pointer text-red-600 hover:fill-red-600 hover:stroke-red-600 transition-colors"
            class:fill-red-600={$likedDreamIds.includes(d.id)}
            class:stroke-red-600={$likedDreamIds.includes(d.id)}
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>

        </div>
      </div>
    </div>
  {/await}
{/if}

<div class="flex mt-6 flex-wrap mx-auto">
  {#each sortedDreams as dream}
    <div
      class="relative bg-white bg-opacity-5 rounded-lg select-none m-4 px-5 pt-2 pb-3 text-2xl flex space-x-2 items-center cursor-pointer hover:scale-105 transition-transform"
      on:click="{() => expandDream(dream)}"
      in:receive={{key:dream.id}}
      out:send={{key:dream.id}}
    >
      <div class="flex flex-col">
        <span><span class="opacity-60 mr-2 font-extralight">I would</span>{truncate(dream.text)}</span>
        <span class="text-lg opacity-80"><span class="opacity-60 mr-2 font-light">because</span>{truncate(dream.reason, 30)}</span>
      </div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        on:click|stopPropagation={() => handleLike(dream.id)}
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-10 h-10 mt-1 p-2 cursor-pointer text-red-600 hover:fill-red-600 hover:stroke-red-600 transition-colors"
        class:fill-red-600={$likedDreamIds.includes(dream.id)}
        class:stroke-red-600={$likedDreamIds.includes(dream.id)}
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
      <!-- {#if dreamIdJustLiked === dream.id}
        {@const wasJustClicked = dreamIdJustLiked === dream.id}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class:!scale-150={wasJustClicked}
          class:!oapcity-100={wasJustClicked}
          class="opacity-0 z-40 absolute top-4 right-4 w-16 h-16 mt-1 p-4 cursor-pointer text-red-600 hover:fill-red-600 hover:stroke-red-600 transition-colors"
          class:fill-red-600={$likedDreamIds.includes(dream.id)}
          class:stroke-red-600={$likedDreamIds.includes(dream.id)}
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      {/if} -->
    </div>

    <!-- <span class="select-none">{dream.likes || 0}</span> -->
  {/each}
</div>