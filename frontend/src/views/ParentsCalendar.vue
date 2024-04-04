<template>
    <div>
        <parent-navbar></parent-navbar>
        <div class="parents-calendar">
            <select v-model="selectedChildId" @change="fetchBookingsForChild">
                <option value="" disabled>Select Child</option>
                <option v-for="child in children" :key="child.id" :value="child.id">{{ child.name }}</option>
            </select>
            <div ref="calendarEl"></div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import API from '@/services/api';
import ParentNavbar from '@/components/ParentNavbar.vue'; 

export default {
    name: 'ParentsCalendar',
    components: {
        ParentNavbar, 
    },
    setup() {
        const selectedChildId = ref('');
        const children = ref([]);
        const calendarEl = ref(null);
        let calendar = null;

        const fetchChildren = async () => {
            try {
                const parentId = localStorage.getItem('parent-id');
                if (!parentId) throw new Error("Parent ID is undefined.");

                const { data } = await API.get(`/children/${parentId}`);
                children.value = data;
            } catch (error) {
                console.error("There was an error fetching the children:", error.message);
            }
        };

        const fetchBookingsForChild = async (childId) => {
            try {
                const { data } = await API.get(`/bookings/${childId}`);
                const events = data.map(booking => ({
                    title: booking.activityId.name,
                    start: booking.activityId.startDate,
                    end: booking.activityId.endDate,
                }));

                if (calendar) {
                    calendar.removeAllEvents(); 
                    calendar.addEventSource(events); 
                }
            } catch (error) {
                console.error("There was an error fetching the bookings:", error.message);
            }
        };

        onMounted(() => {
            fetchChildren();
            calendar = new Calendar(calendarEl.value, {
                plugins: [dayGridPlugin],
                initialView: 'dayGridMonth',
            });
            calendar.render();
        });

        watch(selectedChildId, (newChildId) => {
            if (newChildId) {
                fetchBookingsForChild(newChildId);
            }
        });

        return { selectedChildId, children, calendarEl };
    }
};
</script>

<style scoped>
.parents-calendar {
    /* Style adjustments */
}
</style>
