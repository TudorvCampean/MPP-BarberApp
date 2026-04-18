<?php

namespace App\Http\Controllers\Api;

use App\Domain\Appointments\Contracts\AppointmentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\ListAppointmentsRequest;
use App\Http\Requests\StoreAppointmentRequest;
use App\Http\Requests\UpdateAppointmentRequest;
use Illuminate\Http\JsonResponse;

class AppointmentController extends Controller
{
    public function __construct(private readonly AppointmentServiceInterface $service)
    {
    }

    public function index(ListAppointmentsRequest $request): JsonResponse
    {
        $payload = $this->service->paginate(
            $request->validated(),
            (int) $request->input('page', 1),
            (int) $request->input('per_page', 10),
        );

        return response()->json($payload);
    }

    public function store(StoreAppointmentRequest $request): JsonResponse
    {
        $appointment = $this->service->create($request->validated());

        return response()->json(['data' => $appointment], 201);
    }

    public function show(int $id): JsonResponse
    {
        $appointment = $this->service->find($id);

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        return response()->json(['data' => $appointment]);
    }

    public function update(UpdateAppointmentRequest $request, int $id): JsonResponse
    {
        $appointment = $this->service->update($id, $request->validated());

        if (!$appointment) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        return response()->json(['data' => $appointment]);
    }

    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->service->delete($id);

        if (!$deleted) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        return response()->json([], 204);
    }

    public function statistics(ListAppointmentsRequest $request): JsonResponse
    {
        $stats = $this->service->statistics($request->validated());

        return response()->json(['data' => $stats]);
    }
}

