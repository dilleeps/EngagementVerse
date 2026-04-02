import apiClient from '../../Util/apiClient'

export const fetchActiveClients = async () => {
  try {
    const response = await apiClient.get('clients/get-active', {
      params: {
        status: 'Active'
      }
    })

    const clientNames = response.data.result.map((client) => client.name)

    return clientNames
  } catch (error) {
    console.error('Error fetching active clients:', error.message)
    throw error
  }
}
